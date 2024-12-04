import { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";
export const verifyToken=(req:Request,res:Response,next:NextFunction)=>
{
    console.log("In verify token")
    const token=req.cookies.accessToken
    console.log("TOKEN",token)
    if(!token)
    {
        return res.status(403).json({message:"Token not found"})
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN as string)
        req.user=decoded
        next()
    } catch (error) {
        return res.status(400).json({message:"Error occured during verifying token"})
    }
}
