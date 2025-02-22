"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRepository = void 0;
const Employer_1 = __importDefault(require("../models/Employer"));
const notification_1 = __importDefault(require("../models/notification"));
const User_1 = __importDefault(require("../models/User"));
const baseRepository_1 = require("./baseRepository");
class NotificationRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(notification_1.default);
    }
    async createNotification(notificationData) {
        try {
            const newNotification = new notification_1.default(notificationData);
            return await newNotification.save();
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error creating notification: ${error.message}`);
            }
            else {
                throw new Error(`Error creating notification: Unknown error occurred`);
            }
        }
    }
    async getNotificationForUser(userId) {
        try {
            const notifications = await notification_1.default.find({ recipientId: userId }).sort({ createdAt: -1 });
            const formattedNotifications = await Promise.all(notifications.map(async (notification) => {
                let senderId = "";
                let senderInfo = null;
                if (notification.senderModel === "Employer") {
                    const sender = await Employer_1.default.findById(notification.sender).select("companyName logo");
                    senderId = sender?._id.toString() || "";
                    senderInfo = sender ? { companyName: sender.companyName, logo: sender.logo } : null;
                }
                else {
                    const sender = await User_1.default.findById(notification.sender).select("profilePicture firstName secondName");
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
            }));
            return formattedNotifications;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error in getNotificationForUser: ${error.message}`);
            }
            else {
                throw new Error(`Error in getNotificationForUser`);
            }
        }
    }
    async markNotificationAsRead(notificationId) {
        try {
            return await notification_1.default.findByIdAndUpdate(notificationId, { read: true }, { new: true });
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error markNotificationAsRead: ${error.message}`);
            }
            else {
                throw new Error(`Error creating notification: Unknown error occurred`);
            }
        }
    }
}
exports.NotificationRepository = NotificationRepository;
