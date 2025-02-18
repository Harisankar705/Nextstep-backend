import { Document, Model } from "mongoose";
import { ChatModel } from "../models/chat";
import { IChatRepository } from "../types/repositoryInterface";
import { BaseRepository } from "./baseRepository";
import { IChatMessage } from "../types/authTypes";
import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
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
    async getMessagesForUser(userId: string):Promise<IChatMessage[]> {
        return await this.model.find({
            $or: [
                { sender: userId }, { receiver: userId },
            ],
        }).sort({ timeStamp: -1 });
    }
    async deleteMessageById(messageId: string):Promise<IChatMessage|null> {
        try {
            return await this.model.findByIdAndDelete(messageId);
        } catch (error) {
            throw new Error("Error deleting Message");
        }
    }
}
