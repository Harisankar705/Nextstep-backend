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
exports.InteractionController = void 0;
const interactionService_1 = require("../services/interactionService");
const comment_1 = require("../models/comment");
const statusCode_1 = require("../utils/statusCode");
const types_1 = require("../types/types");
const inversify_1 = require("inversify");
const validateDTO_1 = require("../dtos/validateDTO");
const userDTO_1 = require("../dtos/userDTO");
const post_1 = require("../models/post");
const inversifyContainer_1 = require("../utils/inversifyContainer");
const User_1 = __importDefault(require("../models/User"));
let InteractionController = class InteractionController {
    constructor(interactionService) {
        this.interactionService = interactionService;
    }
    async likePost(req, res, next) {
        try {
            console.log("in likepost");
            const likePostDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.LikeSavePostDTO, req.body);
            const userId = req.user?.userId;
            if (!userId) {
                res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const isLiked = await this.interactionService.likePost(userId, likePostDTO.postId);
            res.status(statusCode_1.STATUS_CODES.OK).json({ success: true, isLiked, message: isLiked ? "Post liked" : "Post unliked" });
        }
        catch (error) {
            next(error);
        }
    }
    async commentPost(req, res, next) {
        try {
            const userId = req.user?.userId;
            console.log('in Commentpost');
            const commentPostDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.CommentPostDTO, req.body);
            if (!userId) {
                res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const comments = await this.interactionService.commentOnPost(userId, commentPostDTO.postId, commentPostDTO.comment);
            const populatedComment = await comment_1.commentModel.findById(comments._id).populate('userId');
            res.status(statusCode_1.STATUS_CODES.CREATED).json({ success: true, comment: populatedComment, message: "Comment added successfully" });
        }
        catch (error) {
            next(error);
        }
    }
    async getPost(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const posts = await this.interactionService.getPosts(userId);
            res.status(statusCode_1.STATUS_CODES.OK).json({ posts });
        }
        catch (error) {
            next(error);
        }
    }
    // public async sharePost(req: Request, res: Response, next: NextFunction) {
    //     try {
    //         const userId = req.user?.userId;
    //         const { postId } = req.body;
    //         if (!userId) {
    //             res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
    //             return;
    //         }
    //         const share = await interactionService.sharePost(userId, postId);
    //         res.status(STATUS_CODES.CREATED).json({ success: true, share, message: "Post shared successfully" });
    //     } catch (error) {
    //         next(error);
    //     }
    // }
    async savePost(req, res, next) {
        try {
            const userId = req.user?.userId;
            const savePostDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.LikeSavePostDTO, req.body);
            if (!userId) {
                res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const response = await this.interactionService.savePost(userId, savePostDTO.postId);
            if (!response?.postIds) {
                throw new Error('post ids are undefined');
            }
            const message = response?.postIds.includes(savePostDTO.postId) ? "Post saved" : "Post unsaved!";
            res.status(statusCode_1.STATUS_CODES.OK).json({ message });
        }
        catch (error) {
            next(error);
        }
    }
    async deletePost(req, res, next) {
        try {
            console.log("REQUEST BODY:", req.body);
            const deletePostDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.LikeSavePostDTO, req.body);
            const post = await this.interactionService.getPostById(deletePostDTO.postId);
            if (!post) {
                res.status(statusCode_1.STATUS_CODES.NOT_FOUND).json({ message: "Post not found" });
                return;
            }
            const user = await User_1.default.findById(post.userId);
            const userEmail = user?.email;
            const isDeleted = await this.interactionService.deletePost(deletePostDTO.postId);
            console.log("ISDELETED", deletePostDTO.postId);
            console.log("ISADMIN", req.user.role);
            if (isDeleted) {
                const isAdmin = req.user.role !== 'admin';
                if (isAdmin) {
                    const emailService = inversifyContainer_1.container.get(types_1.TYPES.EmailService);
                    const subject = `Your post titled "${post.text}" has been deleted due to not following community guidelines!`;
                    const text = `Hello ${user?.firstName},\n\n${subject}\n\nThank you,\nTeam Nextstep`;
                    await emailService.sendEmail(userEmail, subject, text);
                }
                res.status(statusCode_1.STATUS_CODES.OK).json({ message: "Deleted" });
                return;
            }
            else {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Failed to Delete" });
            }
        }
        catch (error) {
            console.error('Error deleting post:', error);
            next(error);
        }
    }
    async getSavedPost(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const savedPosts = await this.interactionService.getSavedPost(userId);
            const posts = await post_1.PostModel.find({ '_id': { $in: savedPosts?.postIds } });
            res.status(statusCode_1.STATUS_CODES.OK).json(posts);
        }
        catch (error) {
            next(error);
        }
    }
    async checkSavedStatus(req, res, next) {
        try {
            const { postId } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized" });
                return;
            }
            if (!postId) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Post ID missing" });
                return;
            }
            const isSaved = await this.interactionService.checkPostSaved(userId, postId);
            res.status(statusCode_1.STATUS_CODES.OK).json({ isSaved });
        }
        catch (error) {
            next(error);
        }
    }
    async getComments(req, res, next) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const postId = req.query.postId;
            if (!postId) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Post ID not provided" });
                return;
            }
            const comments = await this.interactionService.getComments(postId);
            res.status(statusCode_1.STATUS_CODES.OK).json(comments);
        }
        catch (error) {
            next(error);
        }
    }
    async getPostInteractions(req, res, next) {
        try {
            const postId = req.query.postId;
            if (!postId) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Post ID is required" });
                return;
            }
            const interactions = await this.interactionService.getPostInteractions(postId);
            res.status(statusCode_1.STATUS_CODES.OK).json({ success: true, interactions });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.InteractionController = InteractionController;
exports.InteractionController = InteractionController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.InteractionService)),
    __metadata("design:paramtypes", [interactionService_1.InteractionService])
], InteractionController);
