import EmployerModel from "../models/Employer"
import Notification from "../models/notification"
import UserModel from "../models/User"
import { INotificationRepository } from "../types/repositoryInterface"
import { BaseRepository } from "./baseRepository"
import { INotification, NotificationData } from "../types/authTypes"

export class NotificationRepository extends BaseRepository<INotification> implements INotificationRepository {
    constructor()
    {
        super(Notification)
    }
    async createNotification(notificationData:NotificationData)
    {
        
        try {
            const newNotification=new Notification(notificationData)
            return await newNotification.save()
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error creating notification: ${error.message}`);
            } else {
                throw new Error(`Error creating notification: Unknown error occurred`);
            }
        }
        
    }
    async getNotificationForUser(userId: string): Promise<NotificationData[]> {
        try {
            const notifications = await Notification.find({ recipientId: userId }).sort({ createdAt: -1 });
    
            const formattedNotifications: NotificationData[] = await Promise.all(
                notifications.map(async (notification) => {
                    let senderId = "";
                    let senderInfo = null;
    
                    if (notification.senderModel === "Employer") {
                        const sender = await EmployerModel.findById(notification.sender).select("companyName logo");
                        senderId = sender?._id.toString() || "";
                        senderInfo = sender ? { companyName: sender.companyName, logo: sender.logo } : null;
                    } else {
                        const sender = await UserModel.findById(notification.sender).select("profilePicture firstName secondName");
                        senderId = sender?._id.toString() || "";
                        senderInfo = sender ? { firstName: sender.firstName, secondName: sender.secondName, profilePicture: sender.profilePicture } : null;
                    }
    
                    return {
                        recipientId: notification.recipientId.toString(),
                        senderId,
                        senderInfo, 
                        type: notification.type,
                        content: notification.content,
                        link: notification.link || "",
                        read: notification.read,
                        createdAt: notification.createdAt,
                    };
                })
            );
    
            return formattedNotifications;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error in getNotificationForUser: ${error.message}`);
            } else {
                throw new Error(`Error in getNotificationForUser`);
            }
        }
    }
    
    async markNotificationAsRead(notificationId:string)
    {
        try {
            return await Notification.findByIdAndUpdate(notificationId,{read:true},{new:true})
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Error markNotificationAsRead: ${error.message}`);
            } else {
                throw new Error(`Error creating notification: Unknown error occurred`);
            }
        }
        
    }
}