"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobController = void 0;
const jobRepository_1 = require("../repositories/jobRepository");
const applicant_1 = __importDefault(require("../models/applicant"));
const stripe_1 = __importDefault(require("stripe"));
const dotenv_1 = __importDefault(require("dotenv"));
const statusCode_1 = require("../utils/statusCode");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
const jobService_1 = require("../services/jobService");
const validateDTO_1 = require("../dtos/validateDTO");
const userDTO_1 = require("../dtos/userDTO");
dotenv_1.default.config();
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY);
console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
let JobController = class JobController {
    constructor(jobService) {
        this.jobService = jobService;
    }
    async fetchJobs(req, res, next) {
        try {
            console.log('req.boduy', req.body);
            const fetchJobsDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.FetchJobsDTO, req.body);
            const jobs = await this.jobService.getFilteredJobs(fetchJobsDTO.filters);
            res.status(statusCode_1.STATUS_CODES.OK).json(jobs);
        }
        catch (error) {
            next(error);
        }
    }
    async createJob(req, res, next) {
        try {
            const jobData = req.body;
            const employerId = req.user?.userId;
            if (!employerId) {
                res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "Employer id is required" });
                return;
            }
            if (!jobData) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Job details required!" });
                return;
            }
            const job = await this.jobService.createJob(employerId, jobData);
            res.status(statusCode_1.STATUS_CODES.CREATED).json({ message: "Job posted!" });
        }
        catch (error) {
            next(error);
        }
    }
    async getAllJobs(req, res, next) {
        try {
            const employerId = req.user?.userId;
            if (!employerId) {
                res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "Employer id is required" });
            }
            const jobs = await this.jobService.getAllJobs(employerId);
            res.status(statusCode_1.STATUS_CODES.OK).json(jobs);
        }
        catch (error) {
            next(error);
        }
    }
    async getJobById(req, res, next) {
        try {
            const jobId = req.params.jobId;
            const userId = req.user?.userId;
            if (!jobId) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Job ID is required!" });
                return;
            }
            const job = await this.jobService.getJobById(jobId);
            if (!job) {
                res.status(statusCode_1.STATUS_CODES.NOT_FOUND).json({ message: "Job not found!" });
                return;
            }
            let hasApplied = false;
            if (userId) {
                hasApplied = !!(await applicant_1.default.exists({ jobId, userId }));
            }
            res.status(statusCode_1.STATUS_CODES.OK).json({
                ...job.toObject(),
                hasApplied,
            });
        }
        catch (error) {
            next(error);
        }
    }
    async updateJob(req, res, next) {
        try {
            const jobId = req.params.jobId;
            if (!jobId) {
                res.status(statusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Job id is required!" });
                return;
            }
            const jobData = req.body;
            if (!jobData || Object.keys(jobData).length === 0) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Job data not provided!" });
                return;
            }
            const updatedJob = await jobRepository_1.jobRepository.updateJob(jobId, jobData);
            if (updatedJob) {
                res.status(statusCode_1.STATUS_CODES.OK).json({ message: "Job updated!" });
            }
            else {
                res.status(statusCode_1.STATUS_CODES.NOT_FOUND).json({ message: "Job not found!" });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async applyJob(req, res, next) {
        try {
            const { jobId } = req.body;
            const userId = req.user?.userId;
            if (!jobId || !userId) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Job ID and Applicant ID are required" });
                return;
            }
            const job = await this.jobService.applyForJob(jobId, userId);
            res.status(statusCode_1.STATUS_CODES.OK).json({ message: "Application successful", job });
        }
        catch (error) {
            next(error);
        }
    }
    async paymentStripe(req, res, next) {
        try {
            const userId = req.user?.userId;
            const { amount } = req.body;
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'inr',
                            product_data: {
                                name: 'Premium Subscription',
                                description: 'Unlimited job applications access',
                            },
                            unit_amount: amount,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/payment-success?userId=${userId}`,
                cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
            });
            res.json({ url: session.url });
        }
        catch (error) {
            next(error);
        }
    }
    async deleteJob(req, res, next) {
        try {
            const jobId = req.params.jobId;
            if (!jobId) {
                res.status(statusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Job id is required!" });
            }
            const deletedJob = await this.jobService.deleteJob(jobId);
            if (deletedJob) {
                res.status(statusCode_1.STATUS_CODES.OK).json({ message: "Job deleted successfully!" });
            }
            else {
                res.status(statusCode_1.STATUS_CODES.NOT_FOUND).json({ message: "Job not found!" });
            }
        }
        catch (error) {
            next(error);
        }
    }
    async scheduleInterview(req, res, next) {
        try {
            const { userId, jobId, date, time, interviewer, platform, meetingLink } = req.body;
            if (!userId || !jobId || !date || !time || !interviewer || !platform) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: 'Missing required fields' });
                return;
            }
            const scheduleData = {
                date,
                time,
                interviewer,
                platform,
                meetingLink,
            };
            const interview = await this.jobService.scheduleInterview(userId, jobId, scheduleData);
            res.status(statusCode_1.STATUS_CODES.OK).json({ message: "Interview scheduled successfully!" });
        }
        catch (error) {
            next(error);
        }
    }
    async changeApplicationStatus(req, res, next) {
        try {
            const { status, userId } = req.body;
            if (!status || !userId) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: 'Status and userId are required' });
                return;
            }
            const allowedStatuses = ['pending', 'accepted', 'in-review', 'shortlisted', 'rejected', 'interview', 'interviewScheduled', 'interviewCompleted'];
            if (!allowedStatuses.includes(status)) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: 'Invalid status provided' });
                return;
            }
            const updatedApplicant = await this.jobService.changeApplicationStatus(status, userId);
            res.status(statusCode_1.STATUS_CODES.OK).json(updatedApplicant);
        }
        catch (error) {
            next(error);
        }
    }
    async getApplicantsForJob(req, res) {
        try {
            const { jobId } = req.params;
            const { applicants, totalApplicants } = await this.jobService.getApplicantsForJob(jobId);
            res.status(statusCode_1.STATUS_CODES.OK).json({ success: true, data: { applicants, total: totalApplicants } });
        }
        catch (error) {
            res.status(statusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error });
        }
    }
    async changePremiumStatus(req, res) {
        try {
            let { userId } = req.body;
            if (!userId) {
                userId = req.user?.userId;
            }
            const updatedUser = await this.jobService.changeToPremium(userId);
            res.status(statusCode_1.STATUS_CODES.OK).json({ message: "Status changed" });
        }
        catch (error) {
            res.status(statusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: error });
        }
    }
    async applicantStatus(req, res) {
        try {
            const { id } = req.params;
            const jobId = req.query.jobId;
            if (!id || typeof id !== 'string') {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Id not a string" });
                return;
            }
            const response = await this.jobService.applicantDetails(id, jobId);
            res.status(statusCode_1.STATUS_CODES.OK).json(response);
        }
        catch (error) {
            const err = error;
            res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: err.message });
        }
    }
};
exports.JobController = JobController;
exports.JobController = JobController = __decorate([
    __param(0, (0, inversify_1.inject)(types_1.TYPES.JobService)),
    __metadata("design:paramtypes", [jobService_1.JobService])
], JobController);
