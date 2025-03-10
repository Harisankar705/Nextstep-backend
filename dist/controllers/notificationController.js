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
exports.NotificationController = void 0;
const statusCode_1 = require("../utils/statusCode");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
const notificationService_1 = require("../services/notificationService");
let NotificationController = class NotificationController {
    constructor(notificationService) {
        this.notificationService = notificationService;
        this.notificationService = notificationService;
    }
    async getNotification(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "User ID is required" });
                return;
            }
            const notifications = await this.notificationService.getNotification(userId);
            res.status(statusCode_1.STATUS_CODES.OK).json(notifications);
            return;
        }
        catch (error) {
            next(error);
        }
    }
    async markNotificationAsRead(req, res, next) {
        try {
            const notificationId = req.params.notificationId;
            if (!notificationId) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Notification ID is required" });
                return;
            }
            await this.notificationService.markNotificationAsRead(notificationId);
            res.status(statusCode_1.STATUS_CODES.OK).json({ message: "Notification marked as read" });
            return;
        }
        catch (error) {
            next(error);
        }
    }
};
exports.NotificationController = NotificationController;
exports.NotificationController = NotificationController = __decorate([
    __param(0, (0, inversify_1.inject)(types_1.TYPES.NotificationService)),
    __metadata("design:paramtypes", [notificationService_1.NotificationService])
], NotificationController);
