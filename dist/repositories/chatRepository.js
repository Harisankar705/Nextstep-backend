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
exports.ChatRepository = void 0;
const mongoose_1 = require("mongoose");
const baseRepository_1 = require("./baseRepository");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
const mongoose_2 = __importDefault(require("mongoose"));
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
        return await this.model.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: new mongoose_2.default.Types.ObjectId(userId) },
                        { receiverId: new mongoose_2.default.Types.ObjectId(userId) }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "senderUser"
                }
            },
            {
                $lookup: {
                    from: "employers",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "senderEmployer"
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "receiverUser"
                }
            },
            {
                $lookup: {
                    from: "employers",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "receiverEmployer"
                }
            },
            {
                $addFields: {
                    sender: {
                        $cond: {
                            if: { $gt: [{ $size: "$senderUser" }, 0] },
                            then: { $arrayElemAt: ["$senderUser", 0] },
                            else: { $arrayElemAt: ["$senderEmployer", 0] }
                        }
                    },
                    receiver: {
                        $cond: {
                            if: { $gt: [{ $size: "$receiverUser" }, 0] },
                            then: { $arrayElemAt: ["$receiverUser", 0] },
                            else: { $arrayElemAt: ["$receiverEmployer", 0] }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 1,
                    senderId: 1,
                    receiverId: 1,
                    content: 1,
                    type: 1,
                    timestamp: 1,
                    status: 1,
                    file: 1,
                    sender: {
                        _id: 1,
                        firstName: 1,
                        secondName: 1,
                        profilePicture: 1,
                        companyName: 1,
                        logo: 1
                    },
                    receiver: {
                        _id: 1,
                        firstName: 1,
                        secondName: 1,
                        profilePicture: 1,
                        companyName: 1,
                        logo: 1
                    }
                }
            },
            { $sort: { timestamp: -1 } }
        ]);
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
