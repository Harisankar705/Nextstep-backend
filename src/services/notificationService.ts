import { getSenderData } from './../utils/modelUtil';
import EmployerModel from "../models/Employer";
import UserModel from "../models/User";
import { NotificationRepository } from "../repositories/notificationRepository";
const notificationRepository=new NotificationRepository()
import { Server } from "socket.io";
import { NotificationData } from "../types/authTypes";

 class NotificationService
{
    private io:Server 
    constructor(io:Server)
    {
        this.io=io
    }
    async getNotification(userId:string)
    {
        return await notificationRepository.getNotificationForUser(userId)
    }
    async markNotificationAsRead(notificationId:string)
    {
        return await notificationRepository.markNotificationAsRead(notificationId)
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

            const newNotification=await notificationRepository.createNotification(notification)
            if(!notificationData.recipientId)
            {
                return
            }
            this.io.to(notificationData?.recipientId.toString()).emit('newNotification',newNotification)
            return newNotification
        } catch (error) {
            console.log(error)
        }
    }
    
}
const io=new Server()
export const notificationService=new NotificationService(io)