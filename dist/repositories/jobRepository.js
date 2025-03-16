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
const types_1 = require("../types/types");
const inversifyContainer_1 = require("../utils/inversifyContainer");
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
        await Employer_1.default.findByIdAndUpdate(employerId, {
            $addToSet: { jobs: savedJob._id },
        });
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
        try {
            const updatedApplicant = await applicant_1.default.findOneAndUpdate({ userId, jobId }, {
                interviewSchedule: scheduleData,
                applicationStatus: "Interview Scheduled",
            }, { new: true });
            if (!updatedApplicant) {
                throw new Error("Applicant not found or failed to update!");
            }
            const user = await User_1.default.findById(userId);
            if (!user) {
                throw new Error("User not found!");
            }
            const job = await job_1.default.findOne({ _id: jobId }).populate("employerId");
            const employer = job?.employerId;
            if (!job) {
                throw new Error("Job not found!");
            }
            const subject = `Interview Scheduled: ${job.jobTitle} at ${employer.companyName}`;
            const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
        }
        .header {
          background-color: #3498db;
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 5px 5px 0 0;
        }
        .content {
          padding: 20px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 5px 5px;
        }
        .interview-details {
          background-color: #f8f9fa;
          padding: 15px;
          border-left: 4px solid #3498db;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
          color: #777;
        }
        .button {
          display: inline-block;
          background-color: #3498db;
          color: white;
          padding: 10px 20px;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 15px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h2>Interview Scheduled!</h2>
      </div>
      <div class="content">
        <p>Hello ${user.firstName},</p>
        
        <p>Great news! Your interview for the position of <strong>"${job.jobTitle}"</strong> at <strong>"${employer.companyName}"</strong> has been scheduled.</p>
        
        <div class="interview-details">
          <h3>📅 Interview Details:</h3>
          <p><strong>Date:</strong> ${scheduleData.date}</p>
          <p><strong>Time:</strong> ${scheduleData.time}</p>
          <p><strong>Mode:</strong> ${scheduleData.platform || 'Online'}</p>
          ${scheduleData.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${scheduleData.meetingLink}">${scheduleData.meetingLink}</a></p>` : ''}
        </div>
        
        <p>Please make sure to attend the interview on time. We recommend joining the meeting 5 minutes early to ensure your audio and video are working properly.</p>
        
        ${scheduleData.meetingLink ? `<center><a href="${scheduleData.meetingLink}" class="button">Join Interview</a></center>` : ''}
        
        <p>If you have any questions or need to reschedule, please contact us as soon as possible.</p>
        
        <p>Best of luck with your interview!</p>
        
        <p>Warm regards,<br>
        Team ${employer.companyName}</p>
      </div>
      <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
      </div>
    </body>
    </html>
    `;
            const text = `Hello ${user.firstName},
    
Your interview for the position of "${job.jobTitle}" at "${employer.companyName}" has been scheduled.

Interview Details:
- Date: ${scheduleData.date}
- Time: ${scheduleData.time}
- Mode: ${scheduleData.platform || 'Online'}
${scheduleData.meetingLink ? `- Meeting Link: ${scheduleData.meetingLink}` : ''}

Please make sure to attend the interview on time. If you have any questions, feel free to reach out.

Best regards,
Team ${employer.companyName}`;
            const emailService = inversifyContainer_1.container.get(types_1.TYPES.EmailService);
            await emailService.sendEmail(user.email, subject, htmlContent);
            return updatedApplicant;
        }
        catch (error) {
            throw new Error("Failed to schedule interview!");
        }
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
    async getAppliedJobs(userId) {
        try {
            const applications = await applicant_1.default.find({ userId })
                .populate({
                path: "jobId",
                select: "jobTitle companyName employmentTypes salaryRange applicationDeadline",
                populate: {
                    path: "employerId",
                    select: "companyName logo",
                },
            })
                .select("applicationStatus appliedAt");
            console.log("REPOAPPLICATIONS", applications);
            return applications;
        }
        catch (error) {
            throw error;
        }
    }
}
exports.JobRepository = JobRepository;
exports.jobRepository = new JobRepository();
