import { NotificationRepository } from "../repositories/notificationRepository";
const notificationRepository=new NotificationRepository()
const io=require('socket.io')
 class NotificationService
{
    async getNotification(userId:string)
    {
        return await notificationRepository.getNotificationForUser(userId)
    }
    async markNotificationAsRead(notificationId:string)
    {
        return await notificationRepository.markNotificationAsRead(notificationId)
    }
    async createNotification(notificationData)
    {
        try {
            if(!notificationData)
            {
                throw new Error("Notificationdata not available!")
            }
            const newNotification=await notificationRepository.createNotification(notificationData)
            io.to(notificationData.receipient.toString()).emit('newNotification',newNotification)
            return newNotification
        } catch (error) {
            throw new Error("Failed to create notification")
        }
    }
}
export const notificationService=new NotificationService()