import { NextFunction, Request, Response } from "express";
import { STATUS_CODES } from "../utils/statusCode";
import { NotificationData } from "../types/authTypes";
import { INotificationController } from "../types/controllerinterface";
import { inject } from "inversify";
import { TYPES } from "../types/types";
import { NotificationService } from "../services/notificationService";
export class NotificationController implements INotificationController {
        constructor(@inject(TYPES.NotificationService)private notificationService:NotificationService)
        {
            this.notificationService=notificationService
        }
    async getNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId; 
            if (!userId) {
                 res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "User ID is required" });
                 return
            }
            const notifications = await this.notificationService.getNotification(userId); 
             res.status(STATUS_CODES.OK).json(notifications); 
             return
        } catch (error) {
            next(error); 
        }
    }
    async markNotificationAsRead(req: Request, res: Response, next: NextFunction) {
        try {
            const notificationId = req.params.notificationId; 
            if (!notificationId) {
                 res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Notification ID is required" });
                 return
            }
            await this. notificationService.markNotificationAsRead(notificationId); 
             res.status(STATUS_CODES.OK).json({ message: "Notification marked as read" }); 
             return
        } catch (error) {
            next(error); 
        }
    }
}
