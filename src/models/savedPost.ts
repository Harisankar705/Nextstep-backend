import mongoose from "mongoose";
import { ISavedPost } from "../types/authTypes";
const savedPostModal=new mongoose.Schema<ISavedPost>({
    userId:{
        type:String,
        required:true,
    },
    postIds:
    [{
        type:String,
        required:true,
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
})
 const savedPostSchema=mongoose.model<ISavedPost>("SavedPost",savedPostModal)
 export default savedPostSchema