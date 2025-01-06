import { Request, Response } from "express";

const isBlocked=async(req:Request,res:Response,next)=>{
    try {
        const userId=req.user.id
    } catch (error) {
        
    }
}