import { chatModel } from "../models/chat";
import { ChatRepository } from "../repositories/chatRepository";
import { S3 } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();
export class ChatService {
    private s3: S3;
    private chatRepository: ChatRepository = new ChatRepository();
    private readonly bucketRegion: string;
    private readonly bucketName: string;
    constructor() {
        this.validateConfig();
        this.bucketRegion = process.env.AWS_REGION!;
        this.bucketName = process.env.AWS_BUCKET_NAME!;
        this.s3 = new S3({
            region: this.bucketRegion,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            },
            endpoint: `https://s3.${this.bucketRegion}.amazonaws.com`
        });
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
    async sendMessage(data: {
        sender: string;
        receiverId: string;
        content: string;
        status: "sent" | "delivered" | "seen";
        file?: { data: string; name: string; type: string } | null;
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
        });
    }
    async findMessageById(messageId:string)
    {
        return await chatModel.findById(messageId)
    }
    async deleteMessage(messageId:string)
    {
        return await chatModel.findByIdAndDelete(messageId)
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