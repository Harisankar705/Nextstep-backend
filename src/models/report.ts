import mongoose, { Schema } from "mongoose";
import { IReport } from "../types/authTypes";
const reportSchema = new Schema<IReport>({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
    required: true,
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "reporterModel",
    required: true,
  },
  reporterModel: {
    type: String,
    required: true,
    enum: ["User", "Employer"],
  },
  reason: {
    type: String,
    required: true,
    enum: [
      "spam",
      "inappropriate",
      "offensive",
      "misinformation",
      "sexual content",
      "other",
    ],
  },
  description: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    default: "pending",
  },
});
export const ReportModel = mongoose.model<IReport>("Report", reportSchema);
