import { Request, Response } from "express"
import { JobData } from "../types/authTypes"
import { jobService } from "../services/jobService"
import { jobRepository } from '../repositories/jobRepository';
import ApplicantModel from "../models/applicant";
import Stripe from "stripe";
import dotenv from 'dotenv';
dotenv.config();
const stripe=new Stripe(process.env.STRIPE_SECRET_KEY as string)
export const fetchJobs = async (req:Request, res:Response) => {
    try {
        const filters = req.body;
        const jobs = await jobService.getFilteredJobs(filters);
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: "Failed to fetch jobs" });
    }
};
export const createJob=async(req:Request,res:Response)=>
{
    try {
        const jobData:JobData=req.body
        const employerId = req.user?.userId;
        if(!employerId)
        {
            res.status(401).json({message:"Employer id is required"})
            return
        }
        if(!jobData)
        {
            res.status(400).json({message:"Job details required!"})
            return
        }
        const job=await jobService.createJob(employerId,jobData)
        res.status(201).json({message:"Job posted!"})
    } catch (error) {
        res.status(500).json({message:error})
    }   
}
export const getAllJobs=async(req:Request,res:Response)=>{
    try {
        const employerId=req.user?.userId
        if (!employerId) {
            res.status(401).json({ message: "Employer id is required" })
        }
        const jobs=await jobService.getAllJobs(employerId)
        res.status(200).json(jobs)
    } catch (error) {
        res.status(500).json({ message: error })
    }
}
export const getJobById = async (req: Request, res: Response) => {
    try {
        const jobId = req.params.jobId;
        const userId = req.user?.userId; 
        if (!jobId) {
             res.status(400).json({ message: "Job ID is required!" });
             return
        }
        const job = await jobService.getJobById(jobId);
        if (!job) {
            res.status(404).json({ message: "Job not found!" });
            return 
        }
        let hasApplied = false;
        if (userId) {
            hasApplied = !!(await ApplicantModel.exists({ jobId, userId }));
        }
        res.status(200).json({
            ...job.toObject(),
            hasApplied,
        });
    } catch (error) {
        console.error("Error occurred in getJobById:", error);
        res.status(500).json({ message: "An error occurred while fetching the job details." });
    }
};
export const updateJob=async(req:Request,res:Response):Promise<void>=>
{
    try {
        const jobId=req.params.jobId 
        if (!jobId) {
            res.status(500).json({ message: "Job id is required!" })
            return
        }
        const jobData:Partial<JobData>=req.body
        if(!jobData||Object.keys(jobData).length===0)
        {
            res.status(400).json({message:"Job data not provided!"})
            return
        }
        const updatedJob=await jobRepository.updateJob(jobId,jobData)
        if(updatedJob)
        {
            res.status(200).json({message:"Job updated!"})
        }
        else
        {
            res.status(404).json({message:"Job not found!"})
        }
    } catch (error) {
        res.status(500).json({ message: error })
    }
}
export const applyJob = async (req:Request, res:Response) => {
    try {
        const { jobId } = req.body;
        const userId = req.user?.userId;
        if (!jobId || !userId) {
            res.status(400).json({ message: "Job ID and Applicant ID are required" });
            return;
        }
        const job = await jobService.applyForJob(jobId, userId);
        res.status(200).json({ message: "Application successful", job });
    } catch (error) {
        console.error("Error applying for job:", error);
        const errorMessage=error instanceof Error ?error.message:"Error occured"
        res.status(500).json({ message:errorMessage});
    }
};
export const paymentStripe = async (req: Request, res: Response) => {
    try {
        console.log('hhhhhhhhhhhhhhhhhhhhhhh',process.env.FRONTEND_URL)
        const userId=req.user?.userId 
        const { amount } = req.body;
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: 'Premium Subscription',
                            description: 'Unlimited job applications access'
                        },
                        unit_amount: amount, 
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/payment-success?userId=${userId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
        });
        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: 'Payment session creation failed' });
    }
};
export const deleteJob=async(req:Request,res:Response)=>{
    try {
        const jobId=req.params.jobId 
        if (!jobId) {
            res.status(500).json({ message: "Job id is required!" })
        }
        const deletedJob=await jobService.deleteJob(jobId)
        if(deletedJob)
        {
            res.status(204).json({message:"Job deleted successfully!"})
        }
        else
        {
            res.status(404).json({message:"Job not found!"})
        }
    } catch (error) {
        res.status(500).json({ message: error })
    }
}
export const scheduleInterview=async(req:Request,res:Response)=>{
    try {
        const { userId, jobId, date, time, interviewer, platform, meetingLink } = req.body;
        if (!userId ||!jobId|| !date || !time || !interviewer || !platform) {
             res.status(400).json({ message: 'Missing required fields' });
             return
          }
          const scheduleData = {
            date,
            time,
            interviewer,
            platform,
            meetingLink,
          };
        const interview=await jobService.scheduleInterview(userId,jobId,scheduleData)
        res.status(200).json({message:"Interview schedules successfully!"})
    } catch (error) {
        res.status(500).json({ message: error })
    }
}
type ApplicationStatus = 'pending' | 'accepted' |'in-review'|'shortlisted'| 'rejected' |'interview'| 'interviewScheduled' | 'interviewCompleted';
export const changeApplicationStatus = async (req: Request, res: Response) => {
    try {
        const { status, userId } = req.body;
        if (!status || !userId) {
             res.status(400).json({ message: 'Status and userId are required' });
             return
        }
        const allowedStatuses: ApplicationStatus[] = ['pending' ,'accepted' ,'in-review','shortlisted','rejected' ,'interview', 'interviewScheduled' ,'interviewCompleted'];
        if (!allowedStatuses.includes(status as ApplicationStatus)) {
             res.status(400).json({ message: 'Invalid status provided' });
             return
        }
        const updatedApplicant = await jobService.changeApplicationStatus(status, userId);
         res.status(200).json(updatedApplicant);
    } catch (error) {
        console.error('Error changing application status:', error);
         res.status(500).json({ message: 'Internal server error' });
         return
    }
};
// export const getInterviewSchedule = async (req: Request, res: Response) => {
//     try {
//       const { userId } = req.params;
//       if (!userId) {
//         return res.status(400).json({ message: "User ID is required" });
//       }
//       const interview = await jobService.getInterviewSchedule(userId);
//       if (!interview) {
//         return res.status(404).json({ message: "Interview not scheduled" });
//       }
//       res.status(200).json({ message: "Interview fetched successfully", data: interview });
//     } catch (error) {
//       console.error("Error occurred in getInterviewSchedule:", error);
//       res.status(500).json({ message: error.message || "Internal Server Error" });
//     }
//   };
export const getApplicantsForJob=async(req:Request,res:Response)=>{
    try {
        const {jobId}=req.params
        const {applicants,totalApplicants}=await jobService.getApplicantsForJob(jobId)
        res.status(200).json({success:true,data:{applicants,total:totalApplicants}})
    } catch (error) {
        res.status(500).json({ message: error })
    }
}
export const changePremiumStatus=async(req:Request,res:Response)=>{
    try {
        let {userId}=req.body
        if(!userId)
        {
            userId=req.user?.userId
        }
        const updatedUser=await jobService.changeToPremium(userId)
        console.log('changettopremium',updatedUser)
        res.status(200).json({message:"Status changed"})
    } catch (error) {
        res.status(500).json({message:error})
    }
}
export const applicantStatus=async(req:Request,res:Response):Promise<void>=>{
    try {
        const {id}=req.params
        const jobId=req.query.jobId as string
        if(!id||typeof id!=='string')
        {
             res.status(400).json({message:"Id not a string"})
             return
        }
        const response=await jobService.applicantDetails(id,jobId)
        res.status(200).json(response)
    }
     catch (error) {
        const err = error as Error
        res.status(400).json({ message: err.message })
    }
}