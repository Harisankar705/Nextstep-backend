import mongoose from "mongoose";
import { Schema } from "mongoose";

const jobSchema = new Schema({
    employerId: { type: Schema.Types.ObjectId, ref: "Employer", required: true },
    jobTitle: { type: String, required: true },
    description: { type: String, required: true },
    employmentTypes: { type: [String], required: true },
    salaryRange: {
        min: { type: Number, required: true },
        max: { type: Number, required: true }
    },
    categories: { type: [String], required: true },
    requiredSkills: { type: [String], required: true },
    responsibilities: { type: String, required: true },
    whoYouAre: { type: String, required: true },
    niceToHave: { type: String, required: true },
    benefits: { type: [String], required: true },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
});

const JobModel = mongoose.model("Job", jobSchema);
export default JobModel;