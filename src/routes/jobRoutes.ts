import express from 'express'
import { createJob, deleteJob, getAllJobs, getJobById, updateJob } from '../controllers/jobController'
const jobRoutes=express.Router()
jobRoutes.post('/createjob',createJob)
jobRoutes.get('/getjobs',getAllJobs)
jobRoutes.get('/getjob/:jobId',getJobById)
jobRoutes.put('/updatejob/:jobId',updateJob)
jobRoutes.delete('/deletejob/:jobId',deleteJob)