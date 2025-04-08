import mongoose from "mongoose";
import { IApplicant, IEmployer, IJob } from "./../types/authTypes";

import ApplicantModel from "../models/applicant";
import JobModel from "../models/job";
import { Filters, InterviewScheduleData, JobData } from "../types/authTypes";
import cron from "node-cron";
import UserModel from "../models/User";
import { BaseRepository } from "./baseRepository";
import EmployerModel from "../models/Employer";
import { EmailService } from "../utils/emailService";
import { TYPES } from "../types/types";
import { container } from "../utils/inversifyContainer";
export class JobRepository extends BaseRepository<IJob> {
  constructor() {
    super(JobModel);
    cron.schedule("0 0 * * * ", () => {
      this.updateExpiredJob();
    });
  }
  async createJob(jobData: JobData, employerId: string): Promise<IJob> {
    const job = new JobModel({
      ...jobData.formData,
      employerId: employerId,
    });
    const savedJob = await job.save();
    await EmployerModel.findByIdAndUpdate(employerId, {
      $addToSet: { jobs: savedJob._id },
    });
    return savedJob;
  }
  async findCandidateById(userId: string) {
    return ApplicantModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
  }
  async findJobById(jobId: string): Promise<IJob | null> {
    return JobModel.findById(jobId);
  }
  async updateInterviewSchedule(
  userId: string,
  jobId: string,
  scheduleData: InterviewScheduleData
): Promise<IApplicant | null> {
  try {
    const updatedApplicant = await ApplicantModel.findOneAndUpdate(
      { userId, jobId },
      {
        interviewSchedule: scheduleData,
        applicationStatus: "Interview Scheduled",
      },
      { new: true }
    );
    if (!updatedApplicant) {
      throw new Error("Applicant not found or failed to update!");
    }
    
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }
    
    const job = await JobModel.findOne({ _id: jobId }).populate("employerId");
    const employer = job?.employerId as IEmployer;

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

    const emailService = container.get<EmailService>(TYPES.EmailService);
    await emailService.sendEmail(user.email, subject, htmlContent);
    return updatedApplicant;
  } catch (error) {
    throw new Error("Failed to schedule interview!");
  }
}
  async applyJob(jobId: string, userId: string): Promise<IApplicant | IJob> {
    const job = await JobModel.findById(jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    console.log("USERID", userId);
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }
    if (user?.jobApplicantionCount >= 1 && !user?.isPremium) {
      throw new Error(
        "You have reached the maximum.Try preimum to apply for unlimited jobs!"
      );
    }
    const hasApplied = await ApplicantModel.findOne({ jobId, userId });
    if (hasApplied) {
      throw new Error("You have already applied for this job");
    }
    const newApplicant = new ApplicantModel({
      jobId,
      userId,
      applicationStatus: "Pending",
      appliedAt: new Date(),
    });
    user.jobApplicantionCount += 1;
    await user.save();
    await newApplicant.save();
    job.applicantsCount += 1;
    await job.save();
    return newApplicant;
  }
  async fetchJobs(filters?: Filters): Promise<IJob[]> {
    const query: Record<string, unknown> = {};

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

    return await JobModel.find(query)
      .populate("employerId", "companyName logo") // Populate employer data
      .select("jobTitle description employmentTypes salaryRange createdAt") // Select only required fields
      .sort({ createdAt: -1 });
  }

  async getAllJobs(employerId: string): Promise<IJob[]> {
    return await JobModel.find({ employerId });
  }
  async getJobById(jobId: string) {
    try {
      const job = await JobModel.findById(jobId).populate(
        "employerId",
        "companyName logo email website"
      );
      return job;
    } catch (error) {
      throw new Error("Failed to fetch job");
    }
  }
  async updateJob(
    jobId: string,
    jobData: Partial<JobData>
  ): Promise<IJob | null> {
    return await JobModel.findByIdAndUpdate(jobId, jobData, { new: true });
  }
  async deleteJob(jobId: string): Promise<boolean> {
    await JobModel.findByIdAndDelete(jobId);
    return true;
  }
  async findApplicantsByJobId(
    jobId: string
  ): Promise<{
    applicants: IApplicant[];
    totalApplicants?: number | undefined;
  }> {
    const job = await JobModel.findById(jobId);
    const applicants = await ApplicantModel.find({ jobId: jobId })
      .populate("userId", "firstName secondName profilePicture")
      .exec();
    return { applicants, totalApplicants: job?.applicantsCount };
  }
  async updateExpiredJob(): Promise<void> {
    try {
      const currentDate = new Date();
      const expiredJobs = await JobModel.updateMany(
        {
          applicationDeadline: { $lt: currentDate },
          isActive: true,
        },
        {
          $set: { isActive: false },
        }
      );
    } catch (error) {
      throw error;
    }
  }
  async getAppliedJobs(userId: string) {
    try {
      const applications = await ApplicantModel.find({ userId })

        .populate({
          path: "jobId",
          select:
            "jobTitle companyName employmentTypes salaryRange applicationDeadline",
          populate: {
            path: "employerId",
            select: "companyName logo",
          },
        })
        .select("applicationStatus appliedAt");
      console.log("REPOAPPLICATIONS", applications);
      return applications;
    } catch (error) {
      throw error;
    }
  }
}

export const jobRepository = new JobRepository();
