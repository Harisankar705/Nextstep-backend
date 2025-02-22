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
exports.JobService = void 0;
const jobRepository_1 = require("./../repositories/jobRepository");
const applicant_1 = __importDefault(require("../models/applicant"));
const User_1 = __importDefault(require("../models/User"));
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
let JobService = class JobService {
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }
    async createJob(employerId, jobData) {
        try {
            return await this.jobRepository.createJob(jobData, employerId);
        }
        catch (error) {
            throw new Error("Failed to create job");
        }
    }
    async getAllJobs(employerId) {
        try {
            return await this.jobRepository.getAllJobs(employerId);
        }
        catch (error) {
            throw new Error("Failed to fetching all jobs");
        }
    }
    async getJobById(jobId) {
        try {
            return await this.jobRepository.getJobById(jobId);
        }
        catch (error) {
            throw new Error("Failed to fetch job by ID");
        }
    }
    ;
    async applyForJob(jobId, userId) {
        return await this.jobRepository.applyJob(jobId, userId);
    }
    async getFilteredJobs(filters) {
        return await this.jobRepository.fetchJobs(filters);
    }
    ;
    async updateJob(jobId, jobData) {
        try {
            console.log(jobData);
            return await this.jobRepository.updateJob(jobId, jobData);
        }
        catch (error) {
            throw new Error("Failed to update job");
        }
    }
    async changeApplicationStatus(status, userId) {
        const applicant = await this.jobRepository.findCandidateById(userId);
        if (!applicant) {
            throw new Error('Applicant not found');
        }
        applicant.applicationStatus = status;
        await applicant.save();
        return applicant;
    }
    async scheduleInterview(userId, jobId, scheduleData) {
        const candidate = await this.jobRepository.findCandidateById(userId);
        if (!candidate) {
            throw new Error('Candidate not found');
        }
        const job = await this.jobRepository.findJobById(jobId);
        if (!job) {
            throw new Error('Job not found');
        }
        const updatedCandidate = await this.jobRepository.updateInterviewSchedule(userId, jobId, scheduleData);
        if (!updatedCandidate) {
            throw new Error('Failed to update interview schedule');
        }
        candidate.applicationStatus = 'interviewScheduled';
        await candidate.save();
        return updatedCandidate;
    }
    async deleteJob(jobId) {
        try {
            return await this.jobRepository.deleteJob(jobId);
        }
        catch (error) {
            throw new Error("Failed to update job");
        }
    }
    async getApplicantsForJob(jobId) {
        const { applicants, totalApplicants } = await this.jobRepository.findApplicantsByJobId(jobId);
        return { applicants, totalApplicants };
    }
    async changeToPremium(userId) {
        const updatedUser = await User_1.default.findByIdAndUpdate(userId, { isPremium: true }, { new: true });
        if (!updatedUser) {
            throw new Error('No user found');
        }
        return updatedUser;
    }
    async applicantDetails(userId, jobId) {
        try {
            const applicant = await applicant_1.default.findOne({ userId: userId, jobId: jobId }).select('applicationStatus');
            if (!applicant) {
                throw new Error("Applicant not found");
            }
            return applicant.applicationStatus;
        }
        catch (error) {
            throw new Error("Error occurred in applicantDetails");
        }
    }
};
exports.JobService = JobService;
exports.JobService = JobService = __decorate([
    __param(0, (0, inversify_1.inject)(types_1.TYPES.JobRepository)),
    __metadata("design:paramtypes", [jobRepository_1.JobRepository])
], JobService);
