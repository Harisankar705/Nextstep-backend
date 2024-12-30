import { jobRepository } from "../repositories/jobRepository";
import { JobData } from "../types/authTypes";

class JobService
{
    async createJob(employerId:string,jobData:JobData)
    {
        try {
            return await jobRepository.createJob(jobData, employerId)
        } catch (error) {
            console.log("Error creating job",error)
            throw new Error("Failed to create job")
        }
      
    }
    async getAllJobs(employerId:string)
    {
        try {
            return await jobRepository.getAllJobs(employerId) 
        } catch (error) {
            console.log("Error fetching all jobs", error)
            throw new Error("Failed to fetching all jobs")
        }
       
    }
    async getJobById(jobId:string):Promise<JobData|null>

    {
        try {
            return await jobRepository.getJobById(jobId)
            
        } catch (error) {
            console.log("Error fetching job by id", error)
            throw new Error("Failed to fetch jobs by id")
        }
        
    }
    async updateJob(jobId:string,jobData:Partial<JobData>)
    {
        try {
            return await jobRepository.updateJob(jobId, jobData)
        } catch (error) {
            console.log("Error updating job", error)
            throw new Error("Failed to update job")
        }
        
    }
    async deleteJob(jobId:string):Promise<boolean>
    {
        try {
            return await jobRepository.deleteJob(jobId)
        } catch (error) {
            console.log("Error updating job", error)
            throw new Error("Failed to update job")
        }
        
    }
}
export const jobService=new JobService()