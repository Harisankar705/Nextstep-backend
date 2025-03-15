import { JobController } from './../controllers/jobController';
import express from 'express'
import { container } from '../utils/inversifyContainer';
import { TYPES } from '../types/types';
import { AuthMiddleware } from '../middleware/authenticateToken';
export const jobRoutes=express.Router()
const jobController = container.get<JobController>(TYPES.JobController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
jobRoutes.use(authMiddleware.verifyToken.bind(authMiddleware))
jobRoutes.route('/createjob').post(jobController.createJob.bind(jobController))
jobRoutes.route('/getjobs').get(jobController.getAllJobs.bind(jobController))
jobRoutes.route('/applicantDetails/:id').get(jobController.applicantStatus.bind(jobController))
jobRoutes.route('/appliedjobs').get(jobController.getAppliedJobs.bind(jobController))
jobRoutes.route('/getjob/:jobId').get(jobController.getJobById.bind(jobController))

jobRoutes.route('/updatejob/:jobId').put(jobController.updateJob.bind(jobController))
jobRoutes.route('/deletejob/:jobId').delete(authMiddleware.verifyToken.bind(authMiddleware),jobController.deleteJob.bind(jobController))
jobRoutes.route('/fetch-jobs').post(jobController.fetchJobs.bind(jobController))
jobRoutes.route("/apply-job").post(jobController.applyJob.bind(jobController));
jobRoutes.route('/changetopremium').put(jobController.changePremiumStatus.bind(jobController))
jobRoutes.route('/create-payment').post(jobController.paymentStripe.bind(jobController))
jobRoutes.route("/schedule-interview").post(jobController.scheduleInterview.bind(jobController));
jobRoutes.route("/change-applicationstatus").post(jobController.changeApplicationStatus.bind(jobController));
jobRoutes.route('/get-applicants/:jobId').get(jobController.getApplicantsForJob.bind(jobController));

