import mongoose, { Schema } from "mongoose";
import { IPosts } from "../types/authTypes";

const postSchema: Schema<IPosts> = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.ObjectId,
        refPath: "userType",
        required: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['User', 'Employer']
    },
    text: {
        type: String,
        required: true
    },
    image: {
        type: [String],
        required: true
    },
    background: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    comments: [{ type: mongoose.Schema.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose.Schema.ObjectId, ref: "Like" }] 
});

export const postModel = mongoose.model("Post", postSchema);