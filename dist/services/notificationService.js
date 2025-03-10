"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const modelUtil_1 = require("./../utils/modelUtil");
const notificationRepository_1 = require("../repositories/notificationRepository");
const socket_io_1 = require("socket.io");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
let NotificationService = class NotificationService {
    constructor(notificationRepository, socketServer) {
        this.notificationRepository = notificationRepository;
        this.socketServer = socketServer;
        this.io = socketServer;
    }
    async getNotification(userId) {
        return await this.notificationRepository.getNotificationForUser(userId);
    }
    async markNotificationAsRead(notificationId) {
        return await this.notificationRepository.markNotificationAsRead(notificationId);
    }
    async createNotification(notificationData) {
        try {
            if (!notificationData) {
                throw new Error("Notification data not available!");
            }
            const { senderId, recipientId, type, content, link } = notificationData;
            if (!recipientId) {
                throw new Error("No recipient provided");
            }
            const sender = await (0, modelUtil_1.getSenderData)(senderId);
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
            const newNotification = newNotificationDoc.toObject();
            this.io.to(recipientId.toString()).emit('newNotification', newNotification);
            return newNotification;
        }
        catch (error) {
            throw error;
        }
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.NotificationRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.SocketServer)),
    __metadata("design:paramtypes", [notificationRepository_1.NotificationRepository, socket_io_1.Server])
], NotificationService);
