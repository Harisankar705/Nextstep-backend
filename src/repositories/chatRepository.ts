import { Document, Model } from "mongoose";
import { ChatModel } from "../models/chat";
import { IChatRepository } from "../types/repositoryInterface";
import { BaseRepository } from "./baseRepository";
import { IChatMessage } from "../types/authTypes";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import mongoose from "mongoose";
@injectable()
export class ChatRepository extends BaseRepository<IChatMessage> implements IChatRepository {
    constructor(@inject(TYPES.ChatModel)private ChatModel:Model<IChatMessage & Document>) {
        super(ChatModel); 
    }
    async saveMessage(data: IChatMessage):Promise<IChatMessage> {
        return  this.create(data); 
    }
    async getMessages(id: string, userId: string):Promise<IChatMessage[]> {
        return await this.model.find({
            $or: [
                { senderId: id, receiverId: userId },
                { senderId: userId, receiverId: id },
            ],
        }).sort({ timeStamp: 1 });
    }
    async updateMessageStatus(messageId: string, status: "sent" | "delivered" | "seen"):Promise<IChatMessage|null> {
        return await this.model.findByIdAndUpdate(
            messageId,
            {
                status,
                ...(status === "delivered" && { deliveredAt: new Date() }),
                ...(status === "seen" && { seenAt: new Date() }),
            },
            { new: true }
        );
    }
    async getMessagesForUser(userId: string): Promise<IChatMessage[]> {
        return await this.model.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: new mongoose.Types.ObjectId(userId) },
                        { receiverId: new mongoose.Types.ObjectId(userId) }
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
    
    async deleteMessageById(messageId: string):Promise<IChatMessage|null> {
        try {
            return await this.model.findByIdAndDelete(messageId);
        } catch (error) {
            throw new Error("Error deleting Message");
        }
    }
}
