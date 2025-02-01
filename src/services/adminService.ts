import EmployerModel from '../models/Employer';
import UserModel from '../models/User';
import { IEmployer, IUser } from '../types/authTypes';
import { IAdminService } from '../types/serviceInterface';
import { AdminRepository } from './../repositories/adminRepository';
export class AdminService implements IAdminService 
    {
    private adminRepository:AdminRepository
    constructor()
    {
        this.adminRepository=new AdminRepository()
    }
    async toggleUser(id: string, role: string) {
        if (role !== 'user' && role !== 'employer') {
            throw new Error('invalid role provided')
        }
        const model = role === 'user' ? UserModel : EmployerModel
        const updatedUser = await this.adminRepository.changeUserStatus(model, id)
        return updatedUser
    }
    async getIndividualDetails(id: string,role:string): Promise<(IEmployer|IUser)[]> {
        try {
            let details: (IEmployer|IUser)[] = []
            if(role==='employer')
            {
                const employer = await EmployerModel.findById(id)
                if (!employer) {
                    throw new Error("user not found")
                }
                details.push(employer)
            }
            else
            {
                const user=await UserModel.findById(id)
                if(!user)
                {
                    throw new Error("user not found")  
                }
                details.push(user)
            }
            return details
        }
        catch (error) {
            throw new Error("Error occured ing getIndividual details")
        }
    }
    async verifyUser(id: string, status: "VERIFIED" | 'DENIED') {
        if (!id || !status) {
            throw new Error("invalid role or status provided")
            return
        }
        return this.adminRepository.updateVerificationStatus(id, status)
    }
}