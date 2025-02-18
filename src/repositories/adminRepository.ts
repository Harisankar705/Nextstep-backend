import { IApplicant, IEmployer, IUser } from './../types/authTypes';
import { Document, Model } from "mongoose";
import { IAdminRepository } from "../types/repositoryInterface";
import { BaseRepository } from "./baseRepository";
import { inject } from 'inversify';
import { TYPES } from '../types/types';
import { getModel } from '../utils/modelUtil';

export class AdminRepository extends BaseRepository<IUser & Document> implements IAdminRepository {
    constructor(@inject(TYPES.UserModel)private userModel:Model<IUser & Document>,@inject(TYPES.EmployerModel)private employerModel:Model<IEmployer & Document>,)
    {
        super(userModel)
    }
    async  changeUserStatus(model: Model<IUser | IEmployer | IApplicant>, id: string): Promise<IUser | IEmployer | IApplicant | null> {  
        const user = await model.findById(id).lean();
        if (!user) {
            throw new Error("User not found");
        }
        if (!("status" in user)) {
            throw new Error("User does not have a status field");
        }
        const newStatus = user.status === "Active" ? "Inactive" : "Active";
        const updatedUser = await model.findByIdAndUpdate(
            id,
            { $set: { status: newStatus } },
            { new: true, runValidators: true }
        ).lean() as IUser|IEmployer|IApplicant|null
        if (!updatedUser) {
            throw new Error("Failed to update user status");
        }
        return updatedUser;
    }
    async updateVerificationStatus(id: string, status: "VERIFIED" | "DENIED"):Promise<IEmployer|null> {
        try {
            const employer = await this.employerModel.findById(id)
            const updatedEmployer = await this.employerModel.findByIdAndUpdate(id, { $set: { isVerified: status } }, { new: true })
            return updatedEmployer
        } catch (error) {
            throw error
        }
    }

    async getIndividualDetails(id:string,role:string)
    {
        let details:(IEmployer|IUser)[]=[]
        const userModel = await getModel(role)
        if(!userModel)
        {
            throw new Error("Invalid role")
        }
        let userDetails=await (userModel as Model<IEmployer|IUser>).findById(id).populate("jobs")
        if(userDetails)
        {
            details.push(userDetails)

        }
        return details
    }
}