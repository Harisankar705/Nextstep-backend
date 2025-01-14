import mongoose, { Schema, Document } from 'mongoose';

export interface IApplicant extends Document {
  jobId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  applicationStatus: 'pending' | 'accepted' | 'rejected' | 'interviewScheduled' | 'interviewCompleted';
  appliedAt: Date;
  resume?: string; // You can store a file path or URL if needed
  coverLetter?: string;
  interviewSchedule?: {
    date: string;
    time: string;
    interviewer: string;
    platform: 'video' | 'phone' | 'in-person';
    meetingLink?: string;
  };
  notes?: string;
}

const applicantSchema = new Schema<IApplicant>({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applicationStatus: {
    type: String,
    enum: ['pending' ,'accepted' ,'in-review','shortlisted','rejected' ,'interview', 'interviewScheduled' ,'interviewCompleted'],
    default: 'pending',
  },
  appliedAt: { type: Date, default: Date.now },
  resume: { type: String },
  coverLetter: { type: String },
  interviewSchedule: {
    date: { type: String }, 
    time: { type: String }, 
    interviewer: { type: String },
    platform: { type: String, enum: ['video', 'phone', 'in-person'], default: 'video' },
    meetingLink: { type: String },
  },
  notes: { type: String },
});

const ApplicantModel = mongoose.model<IApplicant>('Applicant', applicantSchema);

export default ApplicantModel;
