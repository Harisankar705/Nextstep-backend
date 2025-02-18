import { ChangeApplicationStatusDTO, CreateJobDTO, ScheduleInterviewDTO, UpdateJobDTO,  } from './../dtos/userDTO';
import { NextFunction, Request, Response } from "express";
import { ApplicationStatus, JobData } from "../types/authTypes";
import { jobRepository } from '../repositories/jobRepository';
import ApplicantModel from "../models/applicant";
import Stripe from "stripe";
import dotenv from 'dotenv';
import { STATUS_CODES } from "../utils/statusCode";
import { IJobController } from "../types/controllerinterface";
import { inject } from "inversify";
import { TYPES } from "../types/types";
import { JobService } from "../services/jobService";
import { validateDTO } from "../dtos/validateDTO";
import { ApplyJobDTO, FetchJobsDTO, PaymentStripeDTO } from "../dtos/userDTO";
import { validate } from 'node-cron';
dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);


export class JobController implements IJobController {
    constructor(@inject(TYPES.JobService)private jobService:JobService){}
    async fetchJobs(req: Request, res: Response, next: NextFunction) {
        try {
            console.log('req.boduy',req.body)
            const fetchJobsDTO=await validateDTO(FetchJobsDTO,req.body)
            const jobs = await this.jobService.getFilteredJobs(fetchJobsDTO.filters);
            res.status(STATUS_CODES.OK).json(jobs);
        } catch (error) {
            next(error);
        }
    }
    async createJob(req: Request, res: Response, next: NextFunction) {
        try {
            const jobData: JobData = req.body;
            const employerId = req.user?.userId;
            if (!employerId) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Employer id is required" });
                return;
            }
            if (!jobData) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Job details required!" });
                return;
            }
            const job = await this.jobService.createJob(employerId, jobData);
            res.status(STATUS_CODES.CREATED).json({ message: "Job posted!" });
        } catch (error) {
            next(error);
        }
    }
    async getAllJobs(req: Request, res: Response, next: NextFunction) {
        try {
            const employerId = req.user?.userId;
            if (!employerId) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Employer id is required" });
            }
            const jobs = await this.jobService.getAllJobs(employerId);
            res.status(STATUS_CODES.OK).json(jobs);
        } catch (error) {
            next(error);
        }
    }
    async getJobById(req: Request, res: Response, next: NextFunction) {
        try {
            const jobId = req.params.jobId;
            const userId = req.user?.userId;
            if (!jobId) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Job ID is required!" });
                return;
            }
            const job = await this.jobService.getJobById(jobId);
            if (!job) {
                res.status(STATUS_CODES.NOT_FOUND).json({ message: "Job not found!" });
                return;
            }
            let hasApplied = false;
            if (userId) {
                hasApplied = !!(await ApplicantModel.exists({ jobId, userId }));
            }
            res.status(STATUS_CODES.OK).json({
                ...job.toObject(),
                hasApplied,
            });
        } catch (error) {
            next(error);
        }
    }
    async updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const jobId = req.params.jobId;
            if (!jobId) {
                res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Job id is required!" });
                return;
            }
            const jobData: Partial<JobData> = req.body;
            if (!jobData || Object.keys(jobData).length === 0) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Job data not provided!" });
                return;
            }
            const updatedJob = await jobRepository.updateJob(jobId, jobData);
            if (updatedJob) {
                res.status(STATUS_CODES.OK).json({ message: "Job updated!" });
            } else {
                res.status(STATUS_CODES.NOT_FOUND).json({ message: "Job not found!" });
            }
        } catch (error) {
            next(error);
        }
    }
    async applyJob(req: Request, res: Response, next: NextFunction) {
        try {
            const { jobId } = req.body;
            const userId = req.user?.userId;
            if (!jobId || !userId) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Job ID and Applicant ID are required" });
                return;
            }
            const job = await this.jobService.applyForJob(jobId, userId);
            res.status(STATUS_CODES.OK).json({ message: "Application successful", job });
        } catch (error) {
            next(error);
        }
    }
    async paymentStripe(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            const { amount } = req.body;
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: 'Premium Subscription',
                                description: 'Unlimited job applications access',
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
            next(error);
        }
    }
    async deleteJob(req: Request, res: Response, next: NextFunction) {
        try {
            const jobId = req.params.jobId;
            if (!jobId) {
                res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Job id is required!" });
            }
            const deletedJob = await this.jobService.deleteJob(jobId);
            if (deletedJob) {
                res.status(STATUS_CODES.OK).json({ message: "Job deleted successfully!" });
            } else {
                res.status(STATUS_CODES.NOT_FOUND).json({ message: "Job not found!" });
            }
        } catch (error) {
            next(error);
        }
    }
    async scheduleInterview(req: Request, res: Response, next: NextFunction) {
        try {
            const { userId, jobId, date, time, interviewer, platform, meetingLink } = req.body;
            if (!userId || !jobId || !date || !time || !interviewer || !platform) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Missing required fields' });
                return;
            }
            const scheduleData = {
                date,
                time,
                interviewer,
                platform,
                meetingLink,
            };
            const interview = await this.jobService.scheduleInterview(userId, jobId, scheduleData);
            res.status(STATUS_CODES.OK).json({ message: "Interview scheduled successfully!" });
        } catch (error) {
            next(error);
        }
    }
    async changeApplicationStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { status, userId } = req.body;
            if (!status || !userId) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Status and userId are required' });
                return;
            }
            const allowedStatuses: ApplicationStatus[] = ['pending', 'accepted', 'in-review', 'shortlisted', 'rejected', 'interview', 'interviewScheduled', 'interviewCompleted'];
            if (!allowedStatuses.includes(status as ApplicationStatus)) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'Invalid status provided' });
                return;
            }
            const updatedApplicant = await this.jobService.changeApplicationStatus(status, userId);
            res.status(STATUS_CODES.OK).json(updatedApplicant);
        } catch (error) {
            next(error);
        }
    }
    async getApplicantsForJob(req: Request, res: Response) {
        try {
            const { jobId } = req.params;
            const { applicants, totalApplicants } = await this.jobService.getApplicantsForJob(jobId);
            res.status(STATUS_CODES.OK).json({ success: true, data: { applicants, total: totalApplicants } });
        } catch (error) {
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error });
        }
    }
    async changePremiumStatus(req: Request, res: Response) {
        try {
            let { userId } = req.body;
            if (!userId) {
                userId = req.user?.userId;
            }
            const updatedUser = await this. jobService.changeToPremium(userId);
            res.status(STATUS_CODES.OK).json({ message: "Status changed" });
        } catch (error) {
            res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error });
        }
    }
    async applicantStatus(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const jobId = req.query.jobId as string;
            if (!id || typeof id !== 'string') {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Id not a string" });
                return;
            }
            const response = await this.jobService.applicantDetails(id, jobId);
            res.status(STATUS_CODES.OK).json(response);
        } catch (error) {
            const err = error as Error;
            res.status(STATUS_CODES.BAD_REQUEST).json({ message: err.message });
        }
    }
}
