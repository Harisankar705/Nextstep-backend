import mongoose from "mongoose";
const notification=new mongoose.Schema({
    userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
    message:{type:String,required:true},
    createdAt:{type:Date,default:Date.now}
})
const notificationModel=mongoose.model("Notification",notification)
export default notificationModel