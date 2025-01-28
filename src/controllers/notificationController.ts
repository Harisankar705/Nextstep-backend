import { Request, Response } from "express"
import { notificationService } from "../services/notificationService"
export const getNotification=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId
        console.log('getNotification',userId)
        if (!userId) {
            res.status(401).json({ message: "Employer id is required" })
        }
        const notifications=await notificationService.getNotification(userId)
        console.log("NOTIFICATIONS",notifications)
        res.status(200).json(notifications)
    } catch (error) {
        console.error("Error occurred in getNotification:", error);
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