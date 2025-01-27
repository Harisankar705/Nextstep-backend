import Notification from "../models/notification"

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
        
            const notifications= await Notification.find({receipient:userId})
            .populate('sender','firstName secondName companyName logo profilePicture')
            .sort({createdAt:-1})
            return notifications
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