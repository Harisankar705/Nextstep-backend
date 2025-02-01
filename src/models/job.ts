import { IJob } from './../types/authTypes';
import mongoose from "mongoose";
import { Schema } from "mongoose";
const jobSchema = new Schema<IJob>({
    employerId: { type: Schema.Types.ObjectId, ref: "Employer", required: true },
    jobTitle: { type: String, required: true },
    description: { type: String, required: true },
    employmentTypes: { type: [String], required: true },
    industry: { type: [String], required: true },
    salaryRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    categories: { type: [String], required: true },
    skills: { type: [String], required: true },
    responsibilities: { type: String, required: true },
    whoYouAre: { type: String, required: true },
    niceToHave: { type: String },
    applicantsCount: { type: Number, default: 0 },  

    benefits:[{
        id:String,
        icon:String,
        title:String,
        description:String
    }],
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    applicationDeadline:{type:Date},
    applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Applicant' }], 
});

const JobModel = mongoose.model("Job", jobSchema);
export default JobModel;