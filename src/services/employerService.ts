import { EmployerRepository } from './../repositories/employerRepository';
import { IEmployer } from "../types/authTypes"
import { IEmployerService } from "../types/serviceInterface"
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types';
@injectable()
class EmployerService implements IEmployerService
{
    constructor(@inject(TYPES.EmployerRepository)private employerRepository:EmployerRepository)
    {}
    async updateUser(userId:string,userData:Partial<IEmployer>,logoPath?:string){
        try {
            if(logoPath)
            {
                userData.logo=logoPath
            }
            const updatedUser=await this.employerRepository.updateUser(userId,userData)
            if(!updatedUser)
            {
                throw new Error('User not found')
            }
            return updatedUser
        } catch (error) {
            throw new Error("Error occured while updatingEmployer")
        }
    }
    async isVerified(employerId:string):Promise<boolean>
    {
        return await this. employerRepository.isVerified(employerId)
    }
}
export default EmployerService