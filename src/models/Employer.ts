import mongoose, { Schema } from "mongoose";
import { IEmployer } from "../types/authTypes";
const employerSchema=new Schema<IEmployer>({
    companyName:{type:String,required:true},
    password:{type:String,required:true},
    email:{type:String,required:true},
    logo:{type:String},
    location:{type:String,required:true},
    employees:{type:String,required:true},
    industry:{type:String,required:true},
    dateFounded:{type:Date,required:true},
    description:{type:String,required:true},
    panNumber:{type:String,required:true},
    gstNumber:{type:String,required:true},
    website:{type:String,required:true},
    role:{type:String,default:'employer'},
    isProfileComplete:{type:Boolean,default:false},
    status:{type:String,enum:["Active","Inactive"],default:"Active"}
})
const EmployerModel=mongoose.model<IEmployer>("Employer",employerSchema)
export default EmployerModel