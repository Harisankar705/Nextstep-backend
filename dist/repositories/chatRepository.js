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
exports.ChatRepository = void 0;
const mongoose_1 = require("mongoose");
const baseRepository_1 = require("./baseRepository");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
let ChatRepository = class ChatRepository extends baseRepository_1.BaseRepository {
    constructor(ChatModel) {
        super(ChatModel);
        this.ChatModel = ChatModel;
    }
    async saveMessage(data) {
        return this.create(data);
    }
    async getMessages(id, userId) {
        return await this.model.find({
            $or: [
                { senderId: id, receiverId: userId },
                { senderId: userId, receiverId: id },
            ],
        }).sort({ timeStamp: 1 });
    }
    async updateMessageStatus(messageId, status) {
        return await this.model.findByIdAndUpdate(messageId, {
            status,
            ...(status === "delivered" && { deliveredAt: new Date() }),
            ...(status === "seen" && { seenAt: new Date() }),
        }, { new: true });
    }
    async getMessagesForUser(userId) {
        return await this.model.find({
            $or: [
                { sender: userId }, { receiver: userId },
            ],
        }).sort({ timeStamp: -1 });
    }
    async deleteMessageById(messageId) {
        try {
            return await this.model.findByIdAndDelete(messageId);
        }
        catch (error) {
            throw new Error("Error deleting Message");
        }
    }
};
exports.ChatRepository = ChatRepository;
exports.ChatRepository = ChatRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ChatModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], ChatRepository);
