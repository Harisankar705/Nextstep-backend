import mongoose, { Schema } from "mongoose";
import {  ISubscriptionDocument } from "../types/authTypes";

const subscriptionSchema=new Schema<ISubscriptionDocument>({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    validity:{
        type:String,
        required:true
    },
    features:{
        type:[String],
        required:true
    },
    targetRole:{
        type:String,
        required:true
    },
    status:{
        type:String,
        default:'active'
    },
    createdAt:{
        type:Date,
        default:Date.now()

    }
})
export const SubscriptionModel=mongoose.model("Subscription",subscriptionSchema)