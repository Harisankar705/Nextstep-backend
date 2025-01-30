import { InterviewScheduleData } from './../types/authTypes';
import ApplicantModel from "../models/applicant";
import UserModel from "../models/User";
import { jobRepository } from "../repositories/jobRepository";
import { Filters, JobData } from "../types/authTypes";
type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'interviewScheduled' | 'interviewCompleted';
class JobService
{
    async createJob(employerId:string,jobData:JobData)
    {
        try {
            return await jobRepository.createJob(jobData, employerId)
        } catch (error) {
            throw new Error("Failed to create job")
        }
    }
    async getAllJobs(employerId:string)
    {
        try {
            return await jobRepository.getAllJobs(employerId) 
        } catch (error) {
            throw new Error("Failed to fetching all jobs")
        }
    }
    async getJobById(jobId: string)  {
        try {
            return await jobRepository.getJobById(jobId);
        } catch (error) {
            throw new Error("Failed to fetch job by ID");
        }
    };
    async applyForJob(jobId:string,userId:string){
        return await jobRepository.applyJob(jobId,userId)
    }
    async getFilteredJobs (filters:Filters) {
        return await jobRepository.fetchJobs(filters);
    };
    async updateJob(jobId:string,jobData:Partial<JobData>)
    {
        try {
            return await jobRepository.updateJob(jobId, jobData)
        } catch (error) {
            throw new Error("Failed to update job")
        }
    }
    async changeApplicationStatus(status: ApplicationStatus, userId: string) {
        const applicant = await jobRepository.findCandidateById(userId);
        if (!applicant) {
            throw new Error('Applicant not found');
        }
        applicant.applicationStatus = status; 
        await applicant.save();
        return applicant; 
    }
    async scheduleInterview(
        userId: string,
        jobId: string,
        scheduleData: InterviewScheduleData
    ) {
        const candidate = await jobRepository.findCandidateById(userId);
        if (!candidate) {
            throw new Error('Candidate not found');
        }
        const job = await jobRepository.findJobById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        const updatedCandidate = await jobRepository.updateInterviewSchedule(userId, jobId, scheduleData);
        if (!updatedCandidate) {
            throw new Error('Failed to update interview schedule');
        }
        candidate.applicationStatus = 'interviewScheduled'; 
        await candidate.save(); 
        return updatedCandidate;
    }
    async deleteJob(jobId:string):Promise<boolean>
    {
        try {
            return await jobRepository.deleteJob(jobId)
        } catch (error) {
            throw new Error("Failed to update job")
        }
    }
    async getApplicantsForJob(jobId:string)
    {
        const {applicants,totalApplicants}=await jobRepository.findApplicantsByJobId(jobId)
        return {applicants,totalApplicants}
    }
    async changeToPremium(userId:string)
    {
        const updatedUser=await UserModel.findByIdAndUpdate(userId,{isPremium:true},{new:true})
        if(!updatedUser)
        {
            throw new Error('No user found')
        }
        return updatedUser
    }
    async  applicantDetails(userId: string, jobId: string): Promise<string | null> {
        try {
            const applicant = await ApplicantModel.findOne({ userId: userId, jobId: jobId }).select('applicationStatus'); 
            if (!applicant) {
                throw new Error("Applicant not found");
            }
            return applicant.applicationStatus; 
        } catch (error) {
            throw new Error("Error occurred in applicantDetails");
        }
    }
}
export const jobService=new JobService()