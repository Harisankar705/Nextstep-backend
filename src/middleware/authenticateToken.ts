import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
const userRespository=new UserRepository()
interface JwtPayload
{
userId:string,
role:string,
iat:number,
exp:number
}
export const verifyToken = async(req: Request, res: Response, next: NextFunction) => {
    const employerToken = req.cookies.employerAccessToken
    const candidateToken = req.cookies.userAccessToken
    const token=employerToken||candidateToken
    const role=employerToken?"employer":"user"
    if (!token) {
        
        res.status(403).json({ message: "Token not found" })
        return
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN as string) as JwtPayload
        req.user = decoded
        const userData = await userRespository.findById(decoded.userId,role)
        if(userData?.status=='Inactive')
        {
            res.status(404).json({message:"Authentication restricted!"})        
            res.clearCookie(employerToken?"employerAccessToken":"userAccessToken")
            return
        }
        next()
        
    } catch (error) {
        res.status(400).json({ message: "Error occured during verifying token" })
        return
    }
}
