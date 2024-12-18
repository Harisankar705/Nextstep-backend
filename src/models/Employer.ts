import mongoose, { Schema } from "mongoose";
import { IEmployer } from "../types/authTypes";
const employerSchema=new Schema<IEmployer>({
    companyName:{type:String,required:false},
    password:{type:String,required:false},
    email:{type:String,required:false},
    logo:{type:String},
    location:{type:String,required:false},
    employees:{type:String,required:false},
    industry:{type:String,required:false},
    dateFounded:{type:Date,required:false},
    description:{type:String,required:false},
    document:{type:String},
    documentType: { type: String,enum:["GST","PAN","INCORPORATION","OTHER"] },
    isVerified:{type:String,enum:["PENDING",'APPROVED','REJECTED'],default:"PENDING"},
    documentNumber:{type:String},
    website:{type:String,required:false},
    role:{type:String,default:'employer'},
    isProfileComplete:{type:Boolean,default:false},
    status:{type:String,enum:["Active","Inactive"],default:"Active"}
})
const EmployerModel=mongoose.model<IEmployer>("Employer",employerSchema)
export default EmployerModel