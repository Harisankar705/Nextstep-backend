import UserModel from '../models/User'
import { IUser } from '../types/authTypes'
export class UserRepository
{
    async findByEmail(email:string):Promise<IUser |null>
    {
        try {
        return await UserModel.findOne({email}).exec()
    } catch (error) {
        throw new Error('error occured while finding by mail')
    }
        
    }
    async createUser(userData:IUser):Promise<IUser>
    {
        try {
            const user=new UserModel(userData)
            const savedUser=await user.save()
            return savedUser 
        } catch (error) {
           throw new Error("error occured while creating candidate") 
        }
        
    }
    async updateUser(email:string,userData:Partial<IUser>):Promise<void>
    {
        await UserModel.updateOne({email},{$set:userData})

    }

}