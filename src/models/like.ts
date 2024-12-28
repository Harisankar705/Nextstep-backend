import mongoose, { Schema } from "mongoose";
const likeSchema=new Schema({
    postId:{type:Schema.Types.ObjectId,ref:"Post",required:true},
    userId:{type:Schema.Types.ObjectId,ref:"User",required:true},
    createdAt:{type:Date,default:Date.now()}
})
export const likeModel=mongoose.model('Like',likeSchema)