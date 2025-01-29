import { verificationStatus } from "../controllers/adminController";
import EmployerModel from "../models/Employer";
import { IEmployer } from "../types/authTypes";
import {Types} from 'mongoose'
export class EmployerRepository{
    async updateUser(userId:string,userData:Partial<IEmployer>):Promise<IEmployer|null>{
        try {
            const objectId=new Types.ObjectId(userId)
            const user=await EmployerModel.findById(objectId)
            if(!user)
            {
            throw new Error("employer not found")
            }
            const updatedUser=await EmployerModel.findByIdAndUpdate(objectId,{$set:userData,isProfileComplete:true},{new:true})
            if(!updatedUser)
            {
                throw new Error('failed to update employer')
            }
            return updatedUser
        } catch (error) {
            throw new Error("error occured while updating employer in repository")
        }
    }
    async isVerified(employerId: string): Promise<boolean> {
    
            const employer = await EmployerModel.findById(employerId);
            return employer?.isVerified === 'APPROVED';
        } 
    }
    
