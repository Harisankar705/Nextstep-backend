import { JobController } from './../controllers/jobController';
import express from 'express'
import { container } from '../utils/inversifyContainer';
import { TYPES } from '../types/types';
import { AuthMiddleware } from '../middleware/authenticateToken';
const jobController = container.get<JobController>(TYPES.JobController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

export const jobRoutes=express.Router()
jobRoutes.post('/createjob', authMiddleware.verifyToken.bind(authMiddleware),jobController.createJob.bind(jobController))
jobRoutes.get('/getjobs',authMiddleware.verifyToken.bind(authMiddleware),jobController.getAllJobs.bind(jobController))
jobRoutes.get('/getjob/:jobId',authMiddleware.verifyToken.bind(authMiddleware),jobController.getJobById.bind(jobController))
jobRoutes.put('/updatejob/:jobId',authMiddleware.verifyToken.bind(authMiddleware),jobController.updateJob.bind(jobController))
jobRoutes.delete('/deletejob/:jobId',authMiddleware.verifyToken.bind(authMiddleware),jobController.deleteJob.bind(jobController))
jobRoutes.post('/fetch-jobs',authMiddleware.verifyToken.bind(authMiddleware),jobController.fetchJobs.bind(jobController))
jobRoutes.post("/apply-job",authMiddleware.verifyToken.bind(authMiddleware),jobController.applyJob.bind(jobController));
jobRoutes.put('/changetopremium',authMiddleware.verifyToken.bind(authMiddleware),jobController.changePremiumStatus.bind(jobController))
jobRoutes.post('/create-payment',authMiddleware.verifyToken.bind(authMiddleware),jobController.paymentStripe.bind(jobController))
jobRoutes.post("/schedule-interview",authMiddleware.verifyToken.bind(authMiddleware),jobController.scheduleInterview.bind(jobController));
jobRoutes.post("/change-applicationstatus",authMiddleware.verifyToken.bind(authMiddleware),jobController.changeApplicationStatus.bind(jobController));
jobRoutes.get('/get-applicants/:jobId', authMiddleware.verifyToken.bind(authMiddleware),jobController.getApplicantsForJob.bind(jobController));

