import EmployerModel from "../models/Employer"
import Notification from "../models/notification"
import UserModel from "../models/User"

export class NotificationRepository{
    async createNotification(notificationData:any)
    {
        
        try {
            const newNotification=new Notification(notificationData)
            return await newNotification.save()
        } catch (error:any) {
            throw new Error(`Error creating notification:${error.message}`,)
        }
    }
    async getNotificationForUser(userId:string)
    {
        try {
            const notifications= await Notification.find({recipientId:userId})

            .sort({createdAt:-1})
            const populatedNotifications=await Promise.all(notifications.map(async(notification)=>{
                if(notification.senderModel==='Employer')
                {
                    const sender=await EmployerModel.findById(notification.sender).select('companyName logo')
                    return {...notification.toObject(),sender}
                }
                else
                {
                    const sender=await UserModel.findById(notification.sender).select('profilePicture firstName secondName')
                    return {...notification.toObject(),sender}
                }
            }))
            return populatedNotifications
        } catch (error:any) {
            throw new Error(`Error getting notification ${error.message}`)
        }
    }
    async markNotificationAsRead(notificationId:string)
    {
        try {
            return await Notification.findByIdAndUpdate(notificationId,{read:true},{new:true})
        } catch (error:any) {
            throw new Error(`Error getting notification ${error.message}`)

        }
    }
}