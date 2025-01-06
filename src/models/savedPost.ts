import mongoose from "mongoose";
import { ISavedPost } from "../types/authTypes";
const savedPostModal=new mongoose.Schema<ISavedPost>({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    post:
    {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Post"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})
 const savedPostSchema=mongoose.model<ISavedPost>("SavedPost",savedPostModal)
 export default savedPostSchema