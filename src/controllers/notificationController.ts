import { NextFunction, Request, Response } from "express"
import { notificationService } from "../services/notificationService"
import { STATUS_CODES } from "../utils/statusCode"
export const getNotification=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId=req.user?.userId
        if (!userId) {
            res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Employer id is required" })
        }
        const notifications=await notificationService.getNotification(userId)
        res.status(STATUS_CODES.OK).json(notifications)
    } catch (error) {
        next(error)
    }
}
export const markNotificationAsRead=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const notificationId=req.params.notificationId
        if(!notificationId)
        {
            res.status(STATUS_CODES.UNAUTHORIZED).json({message:"Notification id is required"})
        }
        await notificationService.markNotificationAsRead(notificationId)
    } catch (error) {
        next(error)
    }
}