import { INotificationService } from './../types/serviceInterface';
import { getSenderData } from './../utils/modelUtil';
import { NotificationRepository } from "../repositories/notificationRepository";
import { Server } from "socket.io";
import { INotification, NotificationData } from "../types/authTypes";
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types';
@injectable()
 export class NotificationService implements INotificationService
{
    private io:Server 
    constructor(@inject(TYPES.NotificationRepository)private notificationRepository:NotificationRepository,@inject(TYPES.SocketServer)private socketServer:Server)
    {
        this.io=socketServer
    }
    async getNotification(userId:string):Promise<NotificationData[]>
    {
        return await this.notificationRepository.getNotificationForUser(userId)
    }
    async markNotificationAsRead(notificationId:string):Promise<INotification|null>
    {
        return await this.notificationRepository.markNotificationAsRead(notificationId)
    }
    async createNotification(notificationData: NotificationData): Promise<NotificationData> {
        try {
            if (!notificationData) {
                throw new Error("Notification data not available!");
            }
    
            const { senderId, recipientId, type, content, link } = notificationData;
    
            if (!recipientId) {
                throw new Error("No recipient provided");
            }
    
            const sender = await getSenderData(senderId);
            if (!sender) {
                throw new Error("Sender not found");
            }
    
            let senderDetails = sender.role === 'employer' 
                ? { companyName: sender.companyName, logo: sender.logo } 
                : { profilePicture: sender.profilePicture, secondName: sender.secondName };
    
            const notification = {
                senderId,
                recipientId,
                type,
                content,
                link,
                createdAt: new Date(),
                senderDetails,
                senderModel: sender.role === 'employer' ? 'Employer' : 'User'
            };
    
            // Save notification
            const newNotificationDoc = await this.notificationRepository.createNotification(notification);
            const newNotification = newNotificationDoc.toObject() as unknown as NotificationData; 
    
            this.io.to(recipientId.toString()).emit('newNotification', newNotification);
    
            return newNotification;
        } catch (error) {
            throw error;
        }
    }
    
    
}
