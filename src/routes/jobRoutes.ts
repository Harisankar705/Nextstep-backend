import { jobController } from './../controllers/jobController';
import express from 'express'
import { verifyToken } from "../middleware/authenticateToken";

export const jobRoutes=express.Router()
jobRoutes.post('/createjob',verifyToken,jobController.createJob)
jobRoutes.get('/getjobs',verifyToken,jobController.getAllJobs)
jobRoutes.get('/getjob/:jobId',verifyToken,jobController.getJobById)
jobRoutes.put('/updatejob/:jobId',verifyToken,jobController.updateJob)
jobRoutes.delete('/deletejob/:jobId',jobController.deleteJob)
jobRoutes.post('/fetch-jobs',verifyToken,jobController.fetchJobs)
jobRoutes.post("/apply-job",verifyToken,jobController.applyJob);
jobRoutes.put('/changetopremium',verifyToken,jobController.changePremiumStatus)
jobRoutes.post('/create-payment',verifyToken,jobController.paymentStripe)
jobRoutes.post("/schedule-interview",verifyToken,jobController.scheduleInterview);
jobRoutes.post("/change-applicationstatus",verifyToken,jobController.changeApplicationStatus);
jobRoutes.get('/get-applicants/:jobId', verifyToken,jobController.getApplicantsForJob);

