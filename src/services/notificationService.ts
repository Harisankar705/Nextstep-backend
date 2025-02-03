import { getSenderData } from './../utils/modelUtil';
import { NotificationRepository } from "../repositories/notificationRepository";
import { Server } from "socket.io";
import { NotificationData } from "../types/authTypes";
import Notification from '../models/notification';
 class NotificationService
{
    private io:Server 
    private notificationRepository:NotificationRepository
    constructor(io:Server,notificationRepository:NotificationRepository)
    {
        this.io=io
        this.notificationRepository=notificationRepository
    }
    async getNotification(userId:string)
    {
        return await this.notificationRepository.getNotificationForUser(userId)
    }
    async markNotificationAsRead(notificationId:string)
    {
        return await this.notificationRepository.markNotificationAsRead(notificationId)
    }
    async createNotification(notificationData:NotificationData)
    {
        try {
            if(!notificationData)
            {
                throw new Error("Notificationdata not available!")
            }
            const {senderId,recipientId,type,content,link}=notificationData
            let senderDetails;
            const sender=await getSenderData(senderId)
            const senderModel = sender?.role === 'employer' ? 'Employer' : 'User';
            if(sender?.role==='employer')
            {
                senderDetails={
                    companyName:sender.companyName,
                    logo:sender.logo
                }
            }
            else
            {
                senderDetails={
                    profilePicture:sender?.profilePicture,
                    secondName:sender?.secondName
                }
            }
            const notification={
                type,
                sender:senderId,
                recipientId,
                content,
                link,
                createdAt:new Date(),
                senderDetails,
                senderModel
            }
            const newNotification=await this.notificationRepository.createNotification(notification)
            if(!notificationData.recipientId)
            {
                return
            }
            this.io.to(notificationData?.recipientId.toString()).emit('newNotification',newNotification)
            return newNotification
        } catch (error) {
            throw error
        }
    }
}
const io=new Server()
const notificationRepository=new NotificationRepository()
export const notificationService=new NotificationService(io,notificationRepository)