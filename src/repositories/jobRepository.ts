import JobModel from "../models/job";
import { JobData } from "../types/authTypes";
import cron from 'node-cron'

export class JobRepository
{
    async createJob(jobData: JobData,employerId:string){
        console.log('job',jobData)
        const job = new JobModel({
            ...jobData.formData,
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
    async updateExpiredJob(): Promise<void> { 
        try {
            const currentDate = new Date();
            const expiredJobs = await JobModel.updateMany(
                {
                    applicationDeadline: { $lt: currentDate },
                    isActive: true
                },
                {
                    $set: { isActive: false }
                }
            );
            console.log(`Updated ${expiredJobs.modifiedCount} expired job postings.`);
        } catch (error) {
            console.error("Error updating expired jobs:", error);
        }
    }

    constructor() { 
        cron.schedule('0 0 * * * ', () => {
            console.log("Running scheduled job to update expired jobs...");
            this.updateExpiredJob(); 
        });
    }
    
    
}
export const jobRepository = new JobRepository()