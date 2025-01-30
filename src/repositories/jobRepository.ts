import mongoose from "mongoose";
import ApplicantModel from "../models/applicant";
import JobModel from "../models/job";
import { Filters, InterviewScheduleData, JobData } from "../types/authTypes";
import cron from "node-cron";
import UserModel from "../models/User";
export class JobRepository {
  async createJob(jobData: JobData, employerId: string) {
    const job = new JobModel({
      ...jobData.formData,
      employerId: employerId,
    });
    return await job.save();
  }
  async findCandidateById(userId: string) {
    return ApplicantModel.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });
  }
  async findJobById(jobId: string) {
    return JobModel.findById(jobId);
  }
  async updateInterviewSchedule(
    userId: string,
    jobId: string,
    scheduleData: InterviewScheduleData
  ): Promise<Document | null> {
    return ApplicantModel.findOneAndUpdate(
      { userId, jobId },
      {
        interviewSchedule: scheduleData,
        applicationStatus: "Interview Scheduled",
      },
      { new: true }
    );
  }
  async applyJob(jobId: string, userId: string) {
    const job = await JobModel.findById(jobId);
    if (!job) {
      throw new Error("Job not found");
    }
    const user = await UserModel.findById(userId);
    
    if (!user) {
      return;
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
  async fetchJobs(filters: Filters) {
    const query: any = {};
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
    // // Pagination (optional)
    // const limit = filters.limit || 10; // Default limit to 10
    // const page = filters.page || 1; // Default page to 1
    // const skip = (page - 1) * limit;
    return await JobModel.find(query)
      .populate("employerId", "companyName logo") // Populate employer data
      .select("jobTitle description employmentTypes salaryRange createdAt") // Select only required fields
      .sort({ createdAt: -1 }); // Sort by most recent
    // .skip(skip) // Apply pagination
    // .limit(limit); // Apply pagination
  }
  async getAllJobs(employerId: string) {
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
  async updateJob(jobId: string, jobData: Partial<JobData>) {
    return await JobModel.findByIdAndUpdate(jobId, jobData, { new: true });
  }
  async deleteJob(jobId: string): Promise<boolean> {
    await JobModel.findByIdAndDelete(jobId);
    return true;
  }
  async findApplicantsByJobId(jobId: string) {
    const job = await JobModel.findById(jobId);
    const applicants = await ApplicantModel.find({ jobId: jobId })
      .populate("userId", "firstName secondName profilePicture") // Populating the user details
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
      throw error
    }
  }
  constructor() {
    cron.schedule("0 0 * * * ", () => {
      this.updateExpiredJob();
    });
  }
}
export const jobRepository = new JobRepository();
