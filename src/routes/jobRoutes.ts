import express from 'express'
import { createJob, deleteJob, getAllJobs, getJobById, updateJob } from '../controllers/jobController'
import { verifyToken } from "../middleware/authenticateToken";

export const jobRoutes=express.Router()
jobRoutes.post('/createjob',verifyToken,createJob)
jobRoutes.get('/getjobs',verifyToken,getAllJobs)
jobRoutes.get('/getjob/:jobId',verifyToken,getJobById)
jobRoutes.put('/updatejob/:jobId',verifyToken,updateJob)
jobRoutes.delete('/deletejob/:jobId',deleteJob)