import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "../utils/statusCode";
import { CustomError } from "../types/authTypes";
export const errorHandler=(err:CustomError,req:Request,res:Response,next:NextFunction)=>{
    console.error(err.stack)
    res.status(err.status||STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success:false,
        message:err.message||"Something went wrong"
    })
}
