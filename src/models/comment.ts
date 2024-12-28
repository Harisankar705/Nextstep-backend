import mongoose, { Schema } from "mongoose";
const commentSchema=new  Schema({
    postId:{type:Schema.Types.ObjectId,ref:"Post",required:true},
    userId:{type:Schema.Types.ObjectId,ref:"User",required:true},
    comment:{type:String,required:true},
    likes:[{type:Schema.Types.ObjectId,ref:"User"}],
    replies:[{type:Schema.Types.ObjectId,ref:"Comment"}],
    createdAt:{type:Date,default:Date.now()}
})
export const commentModel = mongoose.model("Comment", commentSchema)