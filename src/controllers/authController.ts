import { Request, Response } from "express";
import AuthService from "../services/authService";
import { googleAuth } from "../utils/googleAuth";
import otpService from "../services/otpService";
import UserModel from "../models/User";
import { generateRefreshToken, generateToken, verifyToken } from "../utils/jwtUtils";
const authService = new AuthService()
const otpServiceInstance = new otpService()
export const setRefreshToken=(res:Response,refreshToken:string)=>{
    res.cookie('refresh-token',refreshToken,{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:"strict",
        maxAge:7*24*60*60*1000
    })
}
const validateRole=(role:string)=>{
    if(!['user','employer'].includes(role))
    {
        return {valid:false,message:"Role is invalid!"}
    }
    return {valid:true}
}
export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('in signup')
        const { userData } = req.body
        const roleValidation=validateRole(userData.role)
        if(!roleValidation.valid)
        {
            res.status(400).json({message:roleValidation.message})
            return
        }
        console.log('req.body', req.body)
        const user = await authService.register(userData)
        res.status(201).json(user)
    } catch (error) {
        const err = error as Error
        res.status(400).json({ message: err.message })
    }
}
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("IN LOGIN")
        const { email, password,role } = req.body
        console.log("REQ",email,password)
        const roleValidation=validateRole(role)
        if(!roleValidation.valid)
        {
            res.status(400).json({message:roleValidation.message})
            return
        }
        const { accessToken, refreshToken,user } = await authService.login(email, password,role)
        setRefreshToken(res,refreshToken)
        console.log("LOGIN",accessToken)
        console.log("LOGIN",user)
        res.status(200).json({ accessToken, user })
        
       

    } catch (error) {
        const err = error as Error
        res.status(400).json({ message: err.message })
    }
}

export const googleAuthController = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('google auth')
        const { tokenId, role } = req.body
        console.log(tokenId)
        const roleValidation=validateRole(role)
        if(!roleValidation.valid)
        {
            res.status(400).json({message:roleValidation.message})
            return
        }
        const { accessToken, user } = await googleAuth(tokenId, role)
        if(accessToken && user)
        {
            
            res.status(200).json({success:true,accessToken,user})
            return 
        }

    } catch (error) {
        const err = error as Error
        res.status(400).json({ message: err.message })
    }
}
export const sendOTPcontroller = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('in send otp')
        const { email, role } = req.body
        const roleValidation=validateRole(role)
        if(!roleValidation.valid)
        {
            res.status(400).json({message:roleValidation.message})
            return
        }
        console.log('req', req.body)
        if (!email || !role) {
            res.status(400).send({ message: "Email and role required!" })
            return
        }
        await otpServiceInstance.sendOTP(email, role)
        res.status(200).send({ message: "otp sended" })


    }
    catch (error) {
        const err = error as Error
        res.status(400).json({ message: err.message })
    }
}
export const resendOTPcontroller=async(req:Request,res:Response):Promise<void>=>{
    try {
        console.log("IN resend otp")
        const {email,role}=req.body
        if(!email || !role)
        {
            res.status(400).send({message:"Email or role required!"})
        }
        const roleValidation=validateRole(role)
        if(!roleValidation.valid)
        {
            res.status(400).json({message:roleValidation.message})
            return
        }
        await otpServiceInstance.resendOTP(email,role)
        res.status(200).send({messsage:"OTP resended"})
        
    }
    catch(error)
    {
       const err=error as Error
       res.status(400).json({message:err.message}) 
    }

}
export const verifyOTPController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, role, otp } = req.body
        console.log("body", req.body)
        console.log('in verifyotp')
        if (!email || !role || !otp) {
            res.status(400).json({ message: "OTP,EMAIL,ROLE is required" })
            return


        }
        const roleValidation=validateRole(role)
        if(!roleValidation.valid)
        {
            res.status(400).json({message:roleValidation.message})
            return
        }
        const isVerified = await otpServiceInstance.verifyOtp(email, otp, role)
        console.log("ISVERIFIFED", isVerified)
        if (isVerified) {
            res.status(200).json({ message: "OTP verification successfull!" })
        }
        else {
            res.status(400).json({ message: "Failed to verify otp" })
        }
    } catch (error) {
        const err = error as Error
        console.log('error', err)
        res.status(400).json({ message: err.message })
    }
}
export const emailOrPhoneNumber = async (req: Request, res: Response): Promise<void> => {
    console.log('in email.phone')
    const { email, phoneNumber } = req.body
    console.log(req.body)
    try {
        const userByEmail = await UserModel.findOne({ email })
        if (userByEmail) {
            res.status(400).json({ isTaken: true, message: "Email already exists" })
            return
        }
        const userByPhoneNumber = await UserModel.findOne({ phoneNumber })
        if (userByPhoneNumber) {

            res.status(400).json({ isTaken: true, message: "Phonenumber already exists" })
            return
        }

        res.json({ isTaken: false })
        return

    } catch (error) {
        const err = error as Error
        console.log('error', err)
        res.status(400).json({ message: err.message })
    }
}
export const refreshTokenController=async(req:Request,res:Response)=>{
    try {
        const refreshToken=req.cookies['refresh-token']
    if(!refreshToken)
    {
        res.status(401).send({message:"Refresh token is missing"})
        return
    }
    const decoded=verifyToken(refreshToken,'refresh')
    if(!decoded)
    {
        res.status(403).send({message:"Failed to decode"})
        return
    }
    const {userId,role}=decoded
    const newAccessToken=generateToken({userId,role})
    const newRefreshToken=generateRefreshToken({userId,role})
    setRefreshToken(res,refreshToken)

    res.status(200).json({accessToken:newAccessToken})
    } catch (error) {
        const err=error as Error
        res.status(400).json({message:err.message})
    }
    
}