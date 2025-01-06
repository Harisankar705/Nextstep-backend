import EmployerModel from "../models/Employer";
import UserModel from "../models/User";

export class AdminRepository{
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
        console.log('updateuser',updatedUser)
        return updatedUser
        
    }
    async updateVerificationStatus(id: string, status: "VERIFIED" | "DENIED") {
        try {
            const employer = await EmployerModel.findById(id)
            const updatedEmployer = await EmployerModel.findByIdAndUpdate(id, { $set: { isVerified: status } }, { new: true })
            return updatedEmployer
        } catch (error) {
            console.error("Error updating verification status", error)
            throw error
        }

}
}