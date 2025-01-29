import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
import { JwtPayload } from "../types/authTypes";
const userRespository=new UserRepository()

export const verifyToken = async(req: Request, res: Response, next: NextFunction) => {
    const employerToken = req.cookies.employerAccessToken
    const candidateToken = req.cookies.userAccessToken
    const token=employerToken||candidateToken
    const role=candidateToken?"user":"employer"
    if (!token) {
        
        res.status(403).json({ message: "Token not found" })
        return
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN as string) as JwtPayload
        
        req.user = decoded
        const userData = await userRespository.findById(decoded.userId,role)
        
        if(!userData ||userData?.status=='Inactive')
        { res.clearCookie(employerToken?"employerAccessToken":"userAccessToken")    
            res.status(404).json({message:"Authentication restricted!"})        
           
            return
        }
        next()
        
    } catch (error) {
        res.status(400).json({ message: "Error occured during verifying token" })
        return
    }
}
