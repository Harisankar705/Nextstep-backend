import mongoose, { Schema, Document } from 'mongoose';
import { IApplicant } from '../types/authTypes';
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
