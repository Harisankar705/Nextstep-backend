import { Document, Model } from "mongoose";
import EmployerModel from "../models/Employer";
import UserModel from "../models/User";
import { IAdminRepository } from "../types/repositoryInterface";
import { BaseRepository } from "./baseRepository";
export class AdminRepository extends BaseRepository<Document> implements IAdminRepository {
    private userModel:Model<Document>
    private employerModel:Model<Document>
    constructor(userModel:Model<Document>,employerModel:Model<Document>)
    {
        super(userModel)
        this.userModel=userModel
        this.employerModel=employerModel
    }
async changeUserStatus(model:typeof UserModel| typeof EmployerModel,id:string):Promise<any> {
        const user=await (model as any).findById(id)
        if(!user)
        {
            throw new Error("user is undefined")
        }
        const newStatus=user.status==="Active"?"Inactive":"Active"
        const updatedUser = await model.updateOne({ _id: id }, { $set: { status: newStatus } }, { new: true });
        if(!updatedUser)
        {
            throw new Error("Failed to update user status")
        }
        return updatedUser
    }
    async updateVerificationStatus(id: string, status: "VERIFIED" | "DENIED") {
        try {
            const employer = await EmployerModel.findById(id)
            const updatedEmployer = await EmployerModel.findByIdAndUpdate(id, { $set: { isVerified: status } }, { new: true })
            return updatedEmployer
        } catch (error) {
            throw error
        }
}
}