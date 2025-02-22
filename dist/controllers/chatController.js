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
exports.ChatController = void 0;
const chatService_1 = require("./../services/chatService");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const statusCode_1 = require("../utils/statusCode");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
const userDTO_1 = require("../dtos/userDTO");
const validateDTO_1 = require("../dtos/validateDTO");
let ChatController = class ChatController {
    constructor(chatService, s3Client) {
        this.chatService = chatService;
        this.s3Client = s3Client;
        this.getChat = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = req.user?.userId;
                const messages = await this.chatService.getChat(id, userId);
                res.status(statusCode_1.STATUS_CODES.OK).json({ messages, userId });
            }
            catch (error) {
                next(error);
            }
        };
        this.getMessages = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized user" });
                    return;
                }
                const messages = await this.chatService.getMessagesForUser(userId);
                res.status(statusCode_1.STATUS_CODES.OK).json(messages);
            }
            catch (error) {
                next(error);
            }
        };
        this.getURL = async (req, res, next) => {
            try {
                const getURLDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.GetURLDTO, req.body);
                const urlParts = new URL(getURLDTO.url);
                const bucket = urlParts.hostname.split(".")[0];
                const key = decodeURIComponent(urlParts.pathname.substring(1));
                const getObjectParams = {
                    Bucket: bucket,
                    Key: key,
                };
                const command = new client_s3_1.GetObjectCommand(getObjectParams);
                const signedURL = await (0, s3_request_presigner_1.getSignedUrl)(this.s3Client, command, { expiresIn: 3600 });
                res.status(statusCode_1.STATUS_CODES.OK).json({ secureURL: signedURL });
            }
            catch (error) {
                next(error);
            }
        };
    }
};
exports.ChatController = ChatController;
exports.ChatController = ChatController = __decorate([
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ChatService)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.S3Client)),
    __metadata("design:paramtypes", [chatService_1.ChatService, client_s3_1.S3Client])
], ChatController);
