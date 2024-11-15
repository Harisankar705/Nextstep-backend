import { Request,Response } from "express";
import AuthService from "../services/authService";
import { googleAuth } from "../utils/googleAuth";
const authService=new AuthService()
export const signup=async(req:Request,res:Response):Promise<void>=>{
    try {
        const user=await authService.register(req.body)
        res.status(201).json(user)
    } catch (error) {
        const err=error as Error
        res.status(400).json({message:err.message})
    }
}
export const login=async(req:Request,res:Response):Promise<void>=>{
    try {
        const{email,password}=req.body
        const {token,user}=await authService.login(email,password)
        res.status(200).json({token,user})

    } catch (error) {
        const err=error as Error
        res.status(400).json({message:err.message})
    }
}

export const googleAuthController=async(req:Request,res:Response):Promise<void>=>{
    try {
        const {tokenId,role}=req.body
        const {token,user}=await googleAuth(tokenId,role)
        
    } catch (error) {
        const err=error as Error
        res.status(400).json({message:err.message})  
    }
}