import { ChatRepository } from './../repositories/chatRepository';
import { ChatModel } from "../models/chat";
import { S3 } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import { IChatService } from "../types/serviceInterface";
import { IChatMessage } from "../types/authTypes";
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types';
dotenv.config();
@injectable()
export class ChatService implements IChatService {
    private s3: S3;
    private readonly bucketRegion: string;
    private readonly bucketName: string;
    constructor(@inject(TYPES.ChatRepository)private chatRepository:ChatRepository,@inject(TYPES.S3Client)private s3Client:S3) {
         this.s3=s3Client
         this.bucketRegion=process.env.AWS_REGION!;
         this.bucketName=process.env.AWS_BUCKET_NAME!;
         this.validateConfig()
        
    }
    private validateConfig() {
        if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
            throw new Error("AWS credentials are not properly configured!");
        }
        if (!process.env.AWS_REGION) {
            throw new Error("AWS region is not configured!");
        }
        if (!process.env.AWS_BUCKET_NAME) {
            throw new Error("AWS bucket name is not configured!");
        }
    }
    async sendMessage(data: {sender: string;receiverId: string;content: string;status: "sent" | "delivered" | "read";file?: { data: string; name: string; type: string } | null;
    }) {
        const { sender, receiverId, content, file } = data;
        if (!sender || !receiverId || !content) {
            throw new Error("Sender, receiverId, and content are required!");
        }
        let fileDataToSave = null;
        if (file) {
            try {
                const uniqueFileName = `${uuidv4()}-${file.name}`;
                const uploadParams = {
                    Bucket: this.bucketName,
                    Key: uniqueFileName,
                    Body: Buffer.from(file.data, "base64"),
                    ContentType: file.type
                };
                await this.s3.putObject(uploadParams);
                fileDataToSave = {
                    name: file.name,
                    type: file.type,
                    url: `https://${this.bucketName}.s3.${this.bucketRegion}.amazonaws.com/${uniqueFileName}`
                };
            } catch (error) {
                throw new Error("Failed to upload file to storage.");
            }
        }
        return await this.chatRepository.saveMessage({
            senderId: data.sender,
            receiverId: data.receiverId,
            content: data.content,
            status: data.status || "sent",
            timestamp: new Date(),
            file: fileDataToSave
        }as IChatMessage);
    }
    async findMessageById(messageId:string)
    {
        return await ChatModel.findById(messageId)
    }
    async deleteMessage(messageId:string)
    {
        const deletedMessage= await ChatModel.findByIdAndDelete(messageId)
        return deletedMessage?true:null
    }
    async updateMessageStatus(messageId:string,status:'sent'|'delivered'|'seen')
    {
        return this.chatRepository.updateMessageStatus(messageId,status)
    }
    async getChat(id:string,userId:string)
    {
        if(!id||!userId)
        {
            throw new Error("Both users are required!")
        }
        return await this.chatRepository.getMessages(id,userId)
    }
    async getMessagesForUser(userId:string)
    {
        if(!userId)
        {
            throw new Error("UserId is required!")
        }
        return await this.chatRepository.getMessagesForUser(userId)
    }
}