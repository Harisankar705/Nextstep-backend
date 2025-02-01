import { Document } from "mongoose";
import { chatModel } from "../models/chat";
import { IChatRepository } from "../types/repositoryInterface";
import { BaseRepository } from "./baseRepository";
import { ChatMessage } from "../types/authTypes";
export class ChatRepository extends BaseRepository<ChatMessage> implements IChatRepository {
    constructor() {
        super(chatModel); 
    }
    async saveMessage(data: ChatMessage):Promise<ChatMessage> {
        return  this.create(data); 
    }
    async getMessages(id: string, userId: string):Promise<ChatMessage[]> {
        return await this.model.find({
            $or: [
                { senderId: id, receiverId: userId },
                { senderId: userId, receiverId: id },
            ],
        }).sort({ timeStamp: 1 });
    }
    async updateMessageStatus(messageId: string, status: "sent" | "delivered" | "seen"):Promise<ChatMessage|null> {
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
    async getMessagesForUser(userId: string):Promise<ChatMessage[]> {
        return await this.model.find({
            $or: [
                { sender: userId }, { receiver: userId },
            ],
        }).sort({ timeStamp: -1 });
    }
    async deleteMessageById(messageId: string):Promise<ChatMessage|null> {
        try {
            return await this.model.findByIdAndDelete(messageId);
        } catch (error) {
            throw new Error("Error deleting Message");
        }
    }
}
