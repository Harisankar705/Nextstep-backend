import { Request, Response } from "express"
import { NotificationService } from "../services/notificationService"
const notificationService=new NotificationService()
export const getNotification=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId
        if (!userId) {
            res.status(401).json({ message: "Employer id is required" })
        }
        const notification=await notificationService.getNotification(userId)
        res.status(200).json({notification})
    } catch (error) {
        console.error("Error occurred in getJobById:", error);
        res.status(500).json({ message: "An error occurred while fetching the notifications." });
    }
}
export const markNotificationAsRead=async(req:Request,res:Response)=>{
    try {
        const notificationId=req.params.notificationId
        if(!notificationId)
        {
            res.status(401).json({message:"Notification id is required"})
        }
        await notificationService.markNotificationAsRead(notificationId)

    } catch (error) {
        console.error("Error occurred in getJobById:", error);
        res.status(500).json({ message: "An error occurred while marking notification as read." });
    }
}