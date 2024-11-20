import mongoose, { Schema } from "mongoose";
import { IEmployer } from "../types/authTypes";
const employerSchema=new Schema<IEmployer>({
    companyName:{type:String,required:true},
    password:{type:String,required:true},
    email:{type:String,required:true},
    role:{type:String,default:'employer'}
})
const EmployerModel=mongoose.model<IEmployer>("Employer",employerSchema)
export default EmployerModel