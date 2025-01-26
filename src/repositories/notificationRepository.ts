const notification=require('../models/notification')
export class NotificationRepository{
    async createNotification(notificationData:any)
    {
        try {
            const newNotification=new notification(notificationData)
            return await newNotification.save()
        } catch (error:any) {
            throw new Error(`Error creating notification:${error.message}`,)
        }
    }
    async getNotificationForUser(userId:string)
    {
        try {
        
            return await notification.find({receipient:userId})
            .populate('sender','firstName secondName companyName logo profilePicture')
            .sort({createdAt:-1})
        } catch (error:any) {
            throw new Error(`Error getting notification ${error.message}`)
        }
    }
    async markNotificationAsRead(notificationId:string)
    {
        try {
            return await notification.findByIdAndUpdate(notificationId,{read:true},{new:true})
        } catch (error:any) {
            throw new Error(`Error getting notification ${error.message}`)

        }
    }
}