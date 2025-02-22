"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const jobSchema = new mongoose_2.Schema({
    employerId: { type: mongoose_2.Schema.Types.ObjectId, ref: "Employer", required: true },
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
    benefits: [{
            id: String,
            icon: String,
            title: String,
            description: String
        }],
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    applicationDeadline: { type: Date },
    applicants: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Applicant' }],
});
const JobModel = mongoose_1.default.model("Job", jobSchema);
exports.default = JobModel;
