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
exports.InteractionService = void 0;
const socket_io_1 = require("socket.io");
const post_1 = require("../models/post");
const interactionRepository_1 = require("../repositories/interactionRepository");
const notificationService_1 = require("./notificationService");
const modelUtil_1 = require("../utils/modelUtil");
const connection_1 = __importDefault(require("../models/connection"));
const inversify_1 = require("inversify");
const notification_1 = __importDefault(require("../models/notification"));
const types_1 = require("../types/types");
const socketConfig_1 = require("../utils/socketConfig");
const User_1 = __importDefault(require("../models/User"));
let InteractionService = class InteractionService {
    constructor(interactionRepository, notificationService, socketServer, socketHandler) {
        this.interactionRepository = interactionRepository;
        this.notificationService = notificationService;
        this.socketServer = socketServer;
        this.socketHandler = socketHandler;
        this.io = socketServer;
    }
    async likePost(userId, postId) {
        try {
            console.log('in createlike');
            const existingLike = await this.interactionRepository.checkUserLiked(userId, postId);
            const post = await this.interactionRepository.getPostById(postId);
            const sender = await User_1.default.findById(userId);
            if (!post)
                throw new Error("Post not found!");
            if (!sender)
                throw new Error("User not found!");
            if (existingLike) {
                await this.interactionRepository.removeLike(userId, postId);
                return false;
            }
            await this.interactionRepository.createLike(userId, postId);
            if (post?.userId.toString() !== userId.toString()) {
                const recipientId = post?.userId.toString();
                const notificationData = {
                    recipientId,
                    sender: userId,
                    type: 'post_like',
                    content: `${sender.firstName} liked your post!`,
                    link: `/candidate-profile/${recipientId}`
                };
                await notification_1.default.create(notificationData);
                this.socketHandler.emitNotification(post.userId.toString(), {
                    sender: sender.firstName,
                    receipientId: post?.userId,
                    content: `${sender?.firstName} send you a connection request!`,
                    link: '/posts/${postId}'
                });
            }
            return true;
        }
        catch (error) {
            throw error;
        }
    }
    async getPostById(postId) {
        return await post_1.PostModel.findById(postId);
    }
    async commentOnPost(userId, postId, comment) {
        if (!comment.trim()) {
            throw new Error("Comment cannot be empty!");
        }
        const sender = await (0, modelUtil_1.getSenderData)(userId);
        if (!sender) {
            throw new Error("User not found!");
        }
        const commentorModel = sender?.role === 'employer' ? 'Employer' : 'User';
        if (!commentorModel) {
            throw new Error("Commentor Model not found");
        }
        const comments = await this.interactionRepository.createComment(userId, postId, comment, commentorModel);
        const updatedPost = await post_1.PostModel.findByIdAndUpdate(postId, {
            $inc: { commentCount: 1 },
            $push: { comments: comments._id }
        }, { new: true });
        const post = await post_1.PostModel.findById(postId);
        if (!post) {
            throw new Error("Post not found");
        }
        const senderName = sender.role === 'employer' ? sender.companyName : `${sender.firstName}`;
        const content = `${senderName} commented on your post!`;
        if (post?.userId.toString() !== userId.toString()) {
            const recipientId = post?.userId.toString();
            const notificationData = {
                recipientId,
                sender: userId,
                comment: comment,
                type: 'post_comment',
                content,
                link: `/candidate-profile/${recipientId}`
            };
            await notification_1.default.create(notificationData);
            this.socketHandler.emitNotification(post.userId.toString(), {
                sender: sender,
                recipientId: post?.userId,
                content,
                link: `/candidate-profile/${recipientId}`
            });
        }
        return comments;
    }
    // async sharePost(userId:string,postId:string)
    // {
    //     const share=await interactionRepository.createShare(userId,postId)
    //     await PostModel.findByIdAndUpdate(postId,{
    //         $inc:{shareCount:1}
    //     })
    //     return share
    // }
    async getPosts(userId) {
        const connections = await connection_1.default.find({ followerId: userId });
        console.log("CONNECTIONS", connections);
        const followingIds = connections.map(connection => connection.followingId);
        console.log(followingIds);
        const posts = await post_1.PostModel.find({ userId: { $in: followingIds } })
            .populate('userId', 'firstName secondName profilePicture')
            .sort({ createdAt: 1 });
        console.log("POSTS", posts);
        return posts;
    }
    async getComments(postId) {
        const comments = await this.interactionRepository.getComments(postId);
        return comments;
    }
    async savePost(userId, postId) {
        const savedPost = await this.interactionRepository.savePost(userId, postId);
        return savedPost;
    }
    async deletePost(postId) {
        const deletePost = await this.interactionRepository.deletePost(postId);
        return deletePost;
    }
    async getSavedPost(userId) {
        const savedPost = await this.interactionRepository.getSavedPost(userId);
        return savedPost;
    }
    async checkPostSaved(userId, postId) {
        return await this.interactionRepository.checkSavedPostStatus(userId, postId);
    }
    async getPostInteractions(postId) {
        const [likeCount, commentCount] = await Promise.all([
            this.interactionRepository.getLikeCount(postId),
            this.interactionRepository.getCommentCount(postId)
        ]);
        return {
            likeCount,
            commentCount,
        };
    }
};
exports.InteractionService = InteractionService;
exports.InteractionService = InteractionService = __decorate([
    __param(0, (0, inversify_1.inject)(types_1.TYPES.InteractionRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.NotificationService)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.SocketServer)),
    __param(3, (0, inversify_1.inject)(new inversify_1.LazyServiceIdentifier(() => types_1.TYPES.SocketHandler))),
    __metadata("design:paramtypes", [interactionRepository_1.InteractionRepository, notificationService_1.NotificationService, socket_io_1.Server,
        socketConfig_1.SocketHandler])
], InteractionService);
