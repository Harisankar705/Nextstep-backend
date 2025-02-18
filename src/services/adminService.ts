import { inject, injectable } from 'inversify';
import EmployerModel from '../models/Employer';
import UserModel from '../models/User';
import { IApplicant, IEmployer, IUser } from '../types/authTypes';
import { IAdminService } from '../types/serviceInterface';
import { AdminRepository } from './../repositories/adminRepository';
import { TYPES } from '../types/types';
import { Model } from 'mongoose';
import { IndividualDetailsDTO, ToggleUserDTO, VerifyUserDTO } from '../dtos/adminDTO';
@injectable()
export class AdminService implements IAdminService 
    {
    constructor(@inject(TYPES.AdminRepository)private adminRepository:AdminRepository){}
    async toggleUser(id: string, role: string) {
        try {
            if (role !== 'user' && role !== 'employer') {
                throw new Error('invalid role provided')
            }
            const model = (role === 'user' ? UserModel : EmployerModel) as Model<IUser | IEmployer | IApplicant>;
            const updatedUser = await this.adminRepository.changeUserStatus(model,id)
            return updatedUser
        } catch (error) {
            throw new Error("Error occured toggleUser")

        }
       
    }
    async getIndividualDetails(id: string,role:string): Promise<(IEmployer|IUser)[]> {
        return this.adminRepository.getIndividualDetails(id,role)
    }
    async verifyUser(id: string, status: "VERIFIED" | 'DENIED') {
        if (!id || !status) {
            throw new Error("invalid role or status provided")
            
        }
        return this.adminRepository.updateVerificationStatus(id, status)
    }
}