import express from 'express'
import { applicantStatus, applyJob, changeApplicationStatus, createJob, deleteJob, fetchJobs, getAllJobs, getApplicantsForJob, getJobById, scheduleInterview, updateJob } from '../controllers/jobController'
import { verifyToken } from "../middleware/authenticateToken";

export const jobRoutes=express.Router()
jobRoutes.post('/createjob',verifyToken,createJob)
jobRoutes.get('/getjobs',verifyToken,getAllJobs)
jobRoutes.get('/getjob/:jobId',verifyToken,getJobById)
jobRoutes.put('/updatejob/:jobId',verifyToken,updateJob)
jobRoutes.delete('/deletejob/:jobId',deleteJob)
jobRoutes.post('/fetch-jobs',verifyToken,fetchJobs)
jobRoutes.post("/apply-job",verifyToken,applyJob);
jobRoutes.post("/schedule-interview",verifyToken,scheduleInterview);
jobRoutes.post("/change-applicationstatus",verifyToken,changeApplicationStatus);
jobRoutes.get('/get-applicants/:jobId', verifyToken, getApplicantsForJob);
jobRoutes.get('/applicantdetails/:id',applicantStatus)

