import { Model, Document } from 'mongoose';
import { IAdmin, IEmployer, IUser } from "../types/authTypes"
import EmployerModel from "../models/Employer"
import UserModel from "../models/User"
import AdminModel from "../models/admin"

export function getModel(role: string): Model<IUser & Document> | Model<IEmployer & Document> |Model<IAdmin & Document> {
        if (role === 'employer') {
            return EmployerModel as Model<IEmployer & Document>
        }
        if (role === 'user') {
            return UserModel as Model<IUser & Document>
        }
        if (role === 'admin') {
            return AdminModel as Model<IAdmin & Document>
        }
        throw new Error(`invalid role${role}`)

    }

    export const getSenderData=async(senderId:string)=>
    {
       const [employer,user]=await Promise.all([
        EmployerModel.findById(senderId),
        UserModel.findById(senderId)
       ])
       if(employer)
       {
        return employer
       }
       else 
       {
        return user
       }
    }