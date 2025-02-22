"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jobRepository = exports.JobRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const applicant_1 = __importDefault(require("../models/applicant"));
const job_1 = __importDefault(require("../models/job"));
const node_cron_1 = __importDefault(require("node-cron"));
const User_1 = __importDefault(require("../models/User"));
const baseRepository_1 = require("./baseRepository");
const Employer_1 = __importDefault(require("../models/Employer"));
class JobRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(job_1.default);
        node_cron_1.default.schedule("0 0 * * * ", () => {
            this.updateExpiredJob();
        });
    }
    async createJob(jobData, employerId) {
        const job = new job_1.default({
            ...jobData.formData,
            employerId: employerId,
        });
        const savedJob = await job.save();
        await Employer_1.default.findByIdAndUpdate(employerId, { $addToSet: { jobs: savedJob._id } });
        return savedJob;
    }
    async findCandidateById(userId) {
        return applicant_1.default.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
    }
    async findJobById(jobId) {
        return job_1.default.findById(jobId);
    }
    async updateInterviewSchedule(userId, jobId, scheduleData) {
        return applicant_1.default.findOneAndUpdate({ userId, jobId }, {
            interviewSchedule: scheduleData,
            applicationStatus: "Interview Scheduled",
        }, { new: true });
    }
    async applyJob(jobId, userId) {
        const job = await job_1.default.findById(jobId);
        if (!job) {
            throw new Error("Job not found");
        }
        console.log("USERID", userId);
        const user = await User_1.default.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        if (user?.jobApplicantionCount >= 1 && !user?.isPremium) {
            throw new Error("You have reached the maximum.Try preimum to apply for unlimited jobs!");
        }
        const hasApplied = await applicant_1.default.findOne({ jobId, userId });
        if (hasApplied) {
            throw new Error("You have already applied for this job");
        }
        const newApplicant = new applicant_1.default({
            jobId,
            userId,
            applicationStatus: "pending",
            appliedAt: new Date(),
        });
        user.jobApplicantionCount += 1;
        await user.save();
        await newApplicant.save();
        job.applicantsCount += 1;
        await job.save();
        return newApplicant;
    }
    async fetchJobs(filters) {
        const query = {};
        // If filters exist and contain values, apply filters
        if (filters) {
            if (filters.search) {
                query.$or = [
                    { jobTitle: { $regex: filters.search, $options: "i" } },
                    { description: { $regex: filters.search, $options: "i" } },
                ];
            }
            if (filters.jobTypes && filters.jobTypes.length > 0) {
                query.employmentTypes = { $in: filters.jobTypes };
            }
            if (filters.experienceLevels && filters.experienceLevels.length > 0) {
                query.categories = { $in: filters.experienceLevels };
            }
        }
        console.log("Query being executed:", JSON.stringify(query, null, 2));
        return await job_1.default.find(query)
            .populate("employerId", "companyName logo") // Populate employer data
            .select("jobTitle description employmentTypes salaryRange createdAt") // Select only required fields
            .sort({ createdAt: -1 });
    }
    async getAllJobs(employerId) {
        return await job_1.default.find({ employerId });
    }
    async getJobById(jobId) {
        try {
            const job = await job_1.default.findById(jobId).populate("employerId", "companyName logo email website");
            return job;
        }
        catch (error) {
            throw new Error("Failed to fetch job");
        }
    }
    async updateJob(jobId, jobData) {
        return await job_1.default.findByIdAndUpdate(jobId, jobData, { new: true });
    }
    async deleteJob(jobId) {
        await job_1.default.findByIdAndDelete(jobId);
        return true;
    }
    async findApplicantsByJobId(jobId) {
        const job = await job_1.default.findById(jobId);
        const applicants = await applicant_1.default.find({ jobId: jobId })
            .populate("userId", "firstName secondName profilePicture")
            .exec();
        return { applicants, totalApplicants: job?.applicantsCount };
    }
    async updateExpiredJob() {
        try {
            const currentDate = new Date();
            const expiredJobs = await job_1.default.updateMany({
                applicationDeadline: { $lt: currentDate },
                isActive: true,
            }, {
                $set: { isActive: false },
            });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.JobRepository = JobRepository;
exports.jobRepository = new JobRepository();
