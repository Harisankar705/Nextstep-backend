import { Request, Response } from "express"
import { JobData } from "../types/authTypes"
import { jobService } from "../services/jobService"
import { jobRepository } from '../repositories/jobRepository';

export const createJob=async(req:Request,res:Response)=>
{
    try {
        const jobData:JobData=req.body
        console.log('jobdata',jobData)
        const employerId = req.user?.userId;
        console.log("EMPloyerid",req.user)
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
        console.log('error occured in createjob',error)
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
        console.log('error occured in getalljobs', error)
        res.status(500).json({ message: error })
    }
}
export const getJobById=async(req:Request,res:Response)=>{
    try {
        const jobId=req.params.jobId
        if(!jobId)
        {
            res.status(500).json({message:"Job id is required!"})
        }
        
        const jobs = await jobService.getJobById(jobId)
        res.status(200).json(jobs)

    } catch (error) {
        console.log('error occured in getalljobs', error)
        res.status(500).json({ message: error })
    }
}
export const updateJob=async(req:Request,res:Response):Promise<void>=>
{
    try {
        console.log('in updatejob')
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
        console.log('error occured in updatejob', error)
        res.status(500).json({ message: error })
    }
}
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
        console.log('error occured in deleteJob', error)
        res.status(500).json({ message: error })
    }
}