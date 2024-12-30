import JobModel from "../models/job";
import { JobData } from "../types/authTypes";

export class JobRepository
{
    async createJob(jobData: JobData,employerId:string){
        const job = new JobModel({
            ...jobData,
            employerId:employerId
        })
        return await job.save()

    }
    async getAllJobs(employerId:string)
    {
        return await JobModel.find({employerId})
    }
    async getJobById(jobId:string):Promise<JobData|null>
    {
        return await JobModel.findById(jobId)
    }
    async updateJob(jobId:string,jobData:Partial<JobData>)
    {
       return await JobModel.findByIdAndUpdate(jobId,jobData,{new:true})
    }
    async deleteJob(jobId:string):Promise<boolean>
    {
         await JobModel.findByIdAndDelete(jobId)
         return true
    }
}
export const jobRepository = new JobRepository()