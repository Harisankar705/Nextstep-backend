import { UserRepository } from './../repositories/userRepository';
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/authTypes";
import { STATUS_CODES } from "../utils/statusCode";
import { inject } from "inversify";
import { TYPES } from '../types/types';
export class AuthMiddleware{
    constructor
    (
        @inject(TYPES.UserRepository)private userRespository:UserRepository
    ){}

 public verifyToken = async (req: Request, res: Response, next: NextFunction) => {
    const employerToken = req.cookies.employerAccessToken;
    const candidateToken = req.cookies.userAccessToken;
    const adminToken = req.cookies.adminAccessToken;
    const token = employerToken || candidateToken || adminToken;
    if (!token) {
         res.status(STATUS_CODES.FORBIDDEN).json({ message: "Token not found" });
         return
    }
    let role: string;
    if (employerToken) {
        role = "employer";
    } else if (candidateToken) {
        role = "user";
    } else if (adminToken) {
        role = "admin";
    } else {
         res.status(STATUS_CODES.FORBIDDEN).json({ message: "Role not recognized" });
         return
    }
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN as string) as JwtPayload;
        req.user = decoded;
        const userData = await this.userRespository.findUserById(decoded.userId, role);
        if (!userData || userData.status === 'Inactive') {
            const cookieName = employerToken ? "employerAccessToken" : candidateToken ? "userAccessToken" : "adminAccessToken";
            res.clearCookie(cookieName);
             res.status(STATUS_CODES.NOT_FOUND).json({ message: "Authentication restricted!" });
             return
        }
        next();
    } catch (error) {
        next(error);
    }
};
}
