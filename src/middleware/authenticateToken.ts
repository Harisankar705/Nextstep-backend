import { Request,Response,NextFunction } from "express";
import { verifyToken } from "../utils/jwtUtils";
export const authenticateToken=(req:Request,res:Response,next:NextFunction)=>{
    try {
        const authHeader=req.headers.authorization
        const token=authHeader && authHeader.split(' ')[1]
        if(!token)
        {
            return res.status(401).json({message:"Access token is missing"})
        }
        const decoded=verifyToken(token,'access')
        if(!decoded)
        {
            return res.status(403).json({message:"Invalid or expired token"})
        }
        (req as any).user=decoded
        next()
    } catch (error) {
        res.status(403).json({message:'Invalid or expired token'})
    }
}