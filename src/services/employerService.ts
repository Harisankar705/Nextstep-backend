import { EmployerRepository } from "../repositories/employerRepository"
import { IEmployer } from "../types/authTypes"

class EmployerService
{
    async updateUser(userId:string,userData:Partial<IEmployer>,logoPath?:string){
        const employerRepository=new EmployerRepository()
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
            console.error("Error occured while updating employer",error)
            throw new Error("Error occured while updatingEmployer")
        }
    }
}
export default EmployerService