import EmployerModel from '../models/employer';
import UserModel from '../models/user';
import { IEmployer } from '../types/authTypes';
import { AdminRepository } from './../repositories/adminRepository';
export class AdminService
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
    async getIndividualDetails(id: string): Promise<(IEmployer)[]> {
        try {

            let details: (IEmployer)[] = []


            const employer = await EmployerModel.findById(id)
            if (!employer) {
                throw new Error("user not found")
            }
            details.push(employer)

            return details

        }
        catch (error) {
            console.error("Error occured in getIndividual Details", error)
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