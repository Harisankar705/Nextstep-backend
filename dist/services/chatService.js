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
exports.ChatService = void 0;
const chatRepository_1 = require("./../repositories/chatRepository");
const chat_1 = require("../models/chat");
const client_s3_1 = require("@aws-sdk/client-s3");
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
dotenv_1.default.config();
let ChatService = class ChatService {
    constructor(chatRepository, s3Client) {
        this.chatRepository = chatRepository;
        this.s3Client = s3Client;
        this.s3 = s3Client;
        this.bucketRegion = process.env.AWS_REGION;
        this.bucketName = process.env.AWS_BUCKET_NAME;
        this.validateConfig();
    }
    validateConfig() {
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
    async sendMessage(data) {
        const { sender, receiverId, content, file } = data;
        if (!sender || !receiverId || !content) {
            throw new Error("Sender, receiverId, and content are required!");
        }
        let fileDataToSave = null;
        if (file) {
            try {
                const uniqueFileName = `${(0, uuid_1.v4)()}-${file.name}`;
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
            }
            catch (error) {
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
    async findMessageById(messageId) {
        return await chat_1.ChatModel.findById(messageId);
    }
    async deleteMessage(messageId) {
        const deletedMessage = await chat_1.ChatModel.findByIdAndDelete(messageId);
        return deletedMessage ? true : null;
    }
    async updateMessageStatus(messageId, status) {
        return this.chatRepository.updateMessageStatus(messageId, status);
    }
    async getChat(id, userId) {
        if (!id || !userId) {
            throw new Error("Both users are required!");
        }
        return await this.chatRepository.getMessages(id, userId);
    }
    async getMessagesForUser(userId) {
        if (!userId) {
            throw new Error("UserId is required!");
        }
        return await this.chatRepository.getMessagesForUser(userId);
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ChatRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.S3Client)),
    __metadata("design:paramtypes", [chatRepository_1.ChatRepository, client_s3_1.S3])
], ChatService);
