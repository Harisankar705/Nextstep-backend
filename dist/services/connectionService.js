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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionService = void 0;
const connectionRepository_1 = require("./../repositories/connectionRepository");
const authTypes_1 = require("../types/authTypes");
const connection_1 = __importDefault(require("../models/connection"));
const notification_1 = __importDefault(require("../models/notification"));
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
let ConnectionService = class ConnectionService {
    constructor(connectionRepository) {
        this.connectionRepository = connectionRepository;
    }
    async followUser(followerId, followingId) {
        if (followerId === followingId) {
            throw new Error("cannot send connection request to yourself!");
        }
        const existingConnection = await this.connectionRepository.findExisitingConnection(followerId, followingId);
        if (existingConnection) {
            await connection_1.default.findByIdAndDelete(existingConnection._id);
            return false;
        }
        await connection_1.default.create({
            followerId: followerId,
            followingId: followingId,
            isFollowBack: false,
            status: authTypes_1.ConnectionStatus.NOTFOLLOWINGBACK
        });
        const notificaton = new notification_1.default({
            userId: followingId,
            message: `${followerId} has followed you!`
        });
        await notificaton.save();
        return true;
    }
    async getConnections(userId) {
        return await this.connectionRepository.getUserConnection(userId);
    }
    async respondToRequest(userId, connectionId, status = authTypes_1.ConnectionStatus.FOLLOWBACK) {
        return await this.connectionRepository.updateConnectionStatus(userId, connectionId, status);
    }
    async getMutualConnections(userId1, userId2) {
        if (!userId1 || !userId2) {
            throw new Error("Both user IDs are required!");
        }
        return await this.connectionRepository.getMutualConnection(userId1, userId2);
    }
    async checkFollowStatus(currentUser, checkUser) {
        const connection = await this.connectionRepository.findExisitingConnection(currentUser, checkUser);
        return connection !== null;
    }
    async unfollow(followerId, followingId) {
        const exisitingConnection = await this.connectionRepository.findExisitingConnection(followerId, followingId);
        if (!exisitingConnection) {
            throw new Error("no connection exists to follow");
        }
        // await this.connectionRepository.removeConnection(exisitingConnection._id)
    }
    async getPendingRequest(userId) {
        return await this.connectionRepository.getPendingRequests(userId);
    }
};
exports.ConnectionService = ConnectionService;
exports.ConnectionService = ConnectionService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ConnectionRepository)),
    __metadata("design:paramtypes", [connectionRepository_1.ConnectionRepository])
], ConnectionService);
