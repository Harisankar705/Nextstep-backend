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
exports.SocketHandler = void 0;
const chatService_1 = require("../services/chatService");
const types_1 = require("../types/types");
const inversify_1 = require("inversify");
const cookie_1 = __importDefault(require("cookie"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRepository_1 = require("../repositories/userRepository");
const interactionService_1 = require("../services/interactionService");
const connectedUsers = {};
let SocketHandler = class SocketHandler {
    constructor(chatService, userRepository, interactionService) {
        this.chatService = chatService;
        this.userRepository = userRepository;
        this.interactionService = interactionService;
    }
    configure(io) {
        io.use(async (socket, next) => {
            try {
                const cookieHeader = socket.handshake.headers.cookie;
                if (!cookieHeader) {
                    return next(new Error("No authentication cookies"));
                }
                const cookies = cookie_1.default.parse(cookieHeader);
                const token = cookies.employerAccessToken || cookies.userAccessToken;
                if (!token) {
                    return next(new Error("No token found in cookies"));
                }
                const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN);
                const role = decoded.role;
                const userData = await this.userRepository.findById(decoded.userId, role);
                if (!userData || userData.status === "Inactive") {
                    return next(new Error("Authentication restricted"));
                }
                socket.data.user = {
                    userId: decoded.userId,
                    role: role,
                };
                connectedUsers[decoded.userId] = socket.id;
                next();
            }
            catch (error) {
                return next(new Error("Authentication error"));
            }
        });
        io.on("connection", (socket) => {
            const userId = socket.data.user.userId;
            socket.on("join", (roomId) => {
                if (!roomId) {
                    throw new Error(`Invalid room ID for user ${userId}`);
                }
                socket.join(roomId);
            });
            socket.on("sendMessage", async (data) => {
                try {
                    if (!data.receiverId) {
                        throw new Error("Invalid message data");
                    }
                    const senderId = socket.data.user.userId;
                    const message = await this.chatService.sendMessage({
                        sender: senderId,
                        receiverId: data.receiverId,
                        content: data.content,
                        status: "sent",
                        file: data.file,
                    });
                    io.to(senderId)
                        .to(data.receiverId)
                        .emit("receiveMessage", {
                        ...message.toObject(),
                        status: "delivered",
                        file: data.file
                            ? {
                                data: data.file.data,
                                name: data.file.name,
                                type: data.file.type,
                            }
                            : null,
                    });
                    socket.emit("messageSent", {
                        messageId: message._id,
                        status: "sent",
                    });
                }
                catch (error) {
                    socket.emit("messageError", {
                        message: "Failed to send message",
                        error: error.message,
                    });
                }
            });
            socket.on("messageStatus", async (data) => {
                try {
                    if (!data.messageIds || data.messageIds.length === 0) {
                        throw new Error("No message IDs provided");
                    }
                    const updatedMessages = await Promise.all(data.messageIds.map(async (messageId) => {
                        return await this.chatService.updateMessageStatus(messageId, data.status);
                    }));
                    io.to(socket.data.user.userId)
                        .to(data.receiverId)
                        .emit("messageStatusUpdate", {
                        messageId: data.messageIds[0],
                        status: data.status,
                        timestamp: new Date().toISOString(),
                    });
                }
                catch (error) {
                    socket.emit("messageError", {
                        message: "Failed to update message status",
                        error: error.message,
                    });
                }
            });
            socket.on("deleteMessage", async (data) => {
                try {
                    const message = await this.chatService.findMessageById(data.messageId);
                    if (!message) {
                        throw new Error("message not  found");
                    }
                    if (!data.messageId || !data.senderId || !data.receiverId) {
                        throw new Error("Invalid deletion request parameters");
                    }
                    if (data.receiverId !== socket.data.user.userId) {
                        throw new Error("Unauthorized message deletion attempt");
                    }
                    await this.chatService.deleteMessage(data.messageId);
                    io.to(data.senderId)
                        .to(data.receiverId)
                        .emit("messageDeleted", {
                        messageId: data.messageId,
                        deleteBy: data.senderId,
                    });
                }
                catch (error) {
                    socket.emit("messageError", {
                        message: "Failed to delete",
                        error: error.message,
                    });
                }
            });
            socket.on('videoCallOffer', (data) => {
                try {
                    const receiverSocketId = connectedUsers[data.receiverId];
                    if (!receiverSocketId) {
                        socket.emit('callError', { message: 'Receiver is offline' });
                        return;
                    }
                    io.to(receiverSocketId).emit('videoCallOffer', {
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        offer: data.offer
                    });
                }
                catch (error) {
                    socket.emit('callError', { message: 'Failed to process video call offer' });
                }
            });
            socket.on('videoCallAnswer', (data) => {
                try {
                    const callerSocketId = connectedUsers[data.receiverId];
                    if (!callerSocketId) {
                        socket.emit('callError', { message: 'Caller is no longer online' });
                        return;
                    }
                    io.to(callerSocketId).emit('videoCallAnswer', {
                        senderId: data.senderId,
                        answer: data.answer
                    });
                }
                catch (error) {
                    socket.emit('callError', { message: 'Failed to process video call answer' });
                }
            });
            socket.on('newIceCandidate', (data) => {
                try {
                    const recipientSocketId = connectedUsers[data.receiverId];
                    if (!recipientSocketId) {
                        socket.emit('callError', { message: 'Recipient is no longer online' });
                        return;
                    }
                    io.to(recipientSocketId).emit('newICECandidate', {
                        senderId: data.senderId,
                        candidate: data.candidate
                    });
                }
                catch (error) {
                    socket.emit('callError', { message: 'Failed to process ICE candidate' });
                }
            });
            socket.on('videoCallHangUp', (data) => {
                try {
                    if (!data.senderId || !data.receiverId) {
                        console.error('Invalid videoCallHangUp data:', data);
                        return;
                    }
                    const recipientSocketId = connectedUsers[data.receiverId];
                    if (recipientSocketId) {
                        io.to(recipientSocketId).emit('videoCallEnded', {
                            senderId: data.senderId,
                            timestamp: new Date().toISOString()
                        });
                        console.log(`Video call hang up: 
            Sender: ${data.senderId}, 
            Recipient: ${data.receiverId}`);
                    }
                    else {
                        console.warn(`Recipient ${data.receiverId} not found in connected users`);
                    }
                }
                catch (error) {
                    console.error('Error in videoCallHangUp:', {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        data
                    });
                }
            });
            socket.on('likePost', async ({ userId, recipient, postId, content, link }) => {
                try {
                    console.log("IN likepost");
                    const updatedPost = await this.interactionService.likePost(userId, postId);
                    io.to(recipient).emit('newNotification', {
                        content,
                        link,
                        postId,
                        userId
                    });
                }
                catch (error) {
                    throw new Error;
                }
            });
            socket.on('commentPost', async ({ userId, postId, comment }) => {
                try {
                    const newComment = await this.interactionService.commentOnPost(userId, postId, comment);
                    const userIdString = newComment.userId.toString();
                    io.to(userIdString).emit('postCommented', { postId, userId, newComment });
                }
                catch (error) {
                    throw new Error;
                }
            });
            socket.on("disconnect", () => {
                delete connectedUsers[userId];
                try {
                    socket.rooms.forEach((room) => {
                        socket.leave(room);
                    });
                }
                catch (error) {
                    throw error;
                }
            });
        });
    }
    ;
};
exports.SocketHandler = SocketHandler;
exports.SocketHandler = SocketHandler = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ChatService)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.UserRepository)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.InteractionService)),
    __metadata("design:paramtypes", [chatService_1.ChatService,
        userRepository_1.UserRepository,
        interactionService_1.InteractionService])
], SocketHandler);
