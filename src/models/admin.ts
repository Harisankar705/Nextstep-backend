import mongoose, { Schema } from "mongoose";
import { IAdmin } from "../types/authTypes";
const adminSchema=new Schema<IAdmin>({
    email:{type:String,required:true},
    password:{type:String,required:true},
    isProfileComplete:{type:Boolean}
})
const AdminModel=mongoose.model<IAdmin>("admin",adminSchema)
export default AdminModel