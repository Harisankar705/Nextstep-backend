import { UserRepository } from '../repositories/userRepository'
import { ILoginResponse, IUser } from '../types/authTypes'
import { comparePassword, hashPassword } from '../utils/hashPassword'
import { generateToken } from '../utils/jwtUtils'
import UserModel from '../models/User'

class AuthService
{
    async register(userData:IUser):Promise<IUser>{
        const userRepository=new UserRepository()
    
    const exisitingUser=await userRepository.findByEmail(userData.email)
    if(exisitingUser)
    {
        throw new Error('User already exists!')
    }
    const hashedPassword=await hashPassword(userData.password)
    const newUser=new UserModel({
        ...userData,
        password:hashedPassword
    })
    await newUser.save()
    return newUser
    }
    async login(email:string,password:string):Promise<ILoginResponse>{
        const userRepository=new UserRepository()
        const user=await userRepository.findByEmail(email)
        if(!user)
        {
            throw new Error('invalid user')
        }
        const isMatch=await comparePassword(password,user.password)
        if(!isMatch)
        {
            throw new Error('invalid password')
        }
        const token=generateToken({userId:user._id.toString(),role:user.role})
        return {token,user}
    
    }
}





export default AuthService