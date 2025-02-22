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
exports.ConnectionController = void 0;
const connectionService_1 = require("./../services/connectionService");
const authTypes_1 = require("../types/authTypes");
const statusCode_1 = require("../utils/statusCode");
const types_1 = require("../types/types");
const inversify_1 = require("inversify");
const userDTO_1 = require("../dtos/userDTO");
const validateDTO_1 = require("../dtos/validateDTO");
let ConnectionController = class ConnectionController {
    constructor(connectionService) {
        this.connectionService = connectionService;
        this.followUser = async (req, res, next) => {
            try {
                const followUserDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.FollowUserDTO, req.body);
                const followerId = req.user?.userId;
                if (!followerId) {
                    res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "Authentication required!" });
                    return;
                }
                const connection = await this.connectionService.followUser(followerId, followUserDTO.followingId);
                res.status(statusCode_1.STATUS_CODES.OK).json({ success: true, data: connection });
                return;
            }
            catch (error) {
                next(error);
                return;
            }
        };
        this.followBack = async (req, res, next) => {
            try {
                const followBackDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.FollowBackDTO, req.body);
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "Authentication required" });
                    return;
                }
                const connection = await this.connectionService.respondToRequest(userId, followBackDTO.connectionId, authTypes_1.ConnectionStatus.FOLLOWBACK);
                if (!connection) {
                    res.status(statusCode_1.STATUS_CODES.NOT_FOUND).json({ message: "Connection request not found" });
                    return;
                }
                res.status(statusCode_1.STATUS_CODES.OK).json({ success: true, data: connection });
                return;
            }
            catch (error) {
                next(error);
                return;
            }
        };
        this.respondToRequest = async (req, res, next) => {
            try {
                const respondToRequestDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.RespondToRequestDTO, req.body);
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "Authentication required" });
                    return;
                }
                const connection = await this.connectionService.respondToRequest(respondToRequestDTO.connectionId, userId, respondToRequestDTO.status);
                res.status(statusCode_1.STATUS_CODES.OK).json({ success: true, data: connection });
                return;
            }
            catch (error) {
                next(error);
                return;
            }
        };
        this.getConnections = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "Authentication required!" });
                    return;
                }
                const connections = await this.connectionService.getConnections(userId);
                res.status(statusCode_1.STATUS_CODES.OK).json({ data: connections });
                return;
            }
            catch (error) {
                next(error);
                return;
            }
        };
        this.getMutualConnections = async (req, res, next) => {
            try {
                const { targetUserId } = req.params;
                const userId = req.user?.userId;
                if (!targetUserId || !userId) {
                    res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "Data not found in params" });
                    return;
                }
                const mutualConnections = await this.connectionService.getMutualConnections(userId, targetUserId);
                res.status(statusCode_1.STATUS_CODES.OK).json({ data: mutualConnections });
                return;
            }
            catch (error) {
                next(error);
                return;
            }
        };
        this.checkFollowStatus = async (req, res, next) => {
            const currentUser = req.user?.userId;
            const checkUser = req.query.followingId;
            if (!currentUser || !checkUser) {
                res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: `${currentUser} id is undefined` });
                return;
            }
            try {
                const isFollowing = await this.connectionService.checkFollowStatus(currentUser, checkUser);
                res.status(statusCode_1.STATUS_CODES.OK).json({ isFollowing });
                return;
            }
            catch (error) {
                next(error);
                return;
            }
        };
        this.pendingRequests = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized" });
                    return;
                }
                const requests = await this.connectionService.getPendingRequest(userId);
                res.status(statusCode_1.STATUS_CODES.OK).json(requests);
                return;
            }
            catch (error) {
                next(error);
                return;
            }
        };
    }
};
exports.ConnectionController = ConnectionController;
exports.ConnectionController = ConnectionController = __decorate([
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ConnectionService)),
    __metadata("design:paramtypes", [connectionService_1.ConnectionService])
], ConnectionController);
