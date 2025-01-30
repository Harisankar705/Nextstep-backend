import { EmployerRepository } from "../repositories/employerRepository"
import { IEmployer } from "../types/authTypes"
const employerRepository=new EmployerRepository()
class EmployerService
{
    async updateUser(userId:string,userData:Partial<IEmployer>,logoPath?:string){
        try {
            if(logoPath)
            {
                userData.logo=logoPath
            }
            const updatedUser=await employerRepository.updateUser(userId,userData)
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
        return await employerRepository.isVerified(employerId)
    }
}
export default EmployerService