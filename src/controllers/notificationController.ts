import { NextFunction, Request, Response } from "express";
import { notificationService } from "../services/notificationService";
import { STATUS_CODES } from "../utils/statusCode";
class NotificationController {
    async getNotification(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId; 
            if (!userId) {
                 res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "User ID is required" });
                 return
            }
            const notifications = await notificationService.getNotification(userId); 
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
            await notificationService.markNotificationAsRead(notificationId); 
             res.status(STATUS_CODES.OK).json({ message: "Notification marked as read" }); 
             return
        } catch (error) {
            next(error); 
        }
    }
}
export const notificationController = new NotificationController();
