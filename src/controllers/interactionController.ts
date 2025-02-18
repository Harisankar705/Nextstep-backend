import { NextFunction, Request, Response } from "express";
import { InteractionService } from "../services/interactionService";
import { commentModel } from "../models/comment";
import { STATUS_CODES } from "../utils/statusCode";
import { IInteractionController } from "../types/controllerinterface";
import { TYPES } from "../types/types";
import { inject, injectable } from "inversify";
import { validateDTO } from "../dtos/validateDTO";
import { CommentPostDTO, LikeSavePostDTO } from "../dtos/userDTO";
import { PostModel } from "../models/post";
@injectable()
export class InteractionController implements IInteractionController {
    constructor(@inject(TYPES.InteractionService)private interactionService:InteractionService){}
    public async likePost(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("in likepost")
            const likePostDTO=await validateDTO(LikeSavePostDTO,req.body)
            const userId = req.user?.userId;
            if (!userId) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const isLiked = await this.interactionService.likePost(userId, likePostDTO.postId);
            res.status(STATUS_CODES.OK).json({ success: true, isLiked, message: isLiked ? "Post liked" : "Post unliked" });
        } catch (error) {
            next(error);
        }
    }
    public async commentPost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            console.log('in Commentpost')
            const commentPostDTO=await validateDTO(CommentPostDTO,req.body)
            if (!userId) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const comments = await this.interactionService.commentOnPost(userId, commentPostDTO.postId,commentPostDTO.comment);
            const populatedComment = await commentModel.findById(comments._id).populate('userId');
            res.status(STATUS_CODES.CREATED).json({ success: true, comment: populatedComment, message: "Comment added successfully" });
        } catch (error) {
            next(error);
        }
    }
    public async getPost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const posts = await this.interactionService.getPosts(userId);
            res.status(STATUS_CODES.OK).json({ posts });
        } catch (error) {
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
    public async savePost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            const savePostDTO=await validateDTO(LikeSavePostDTO,req.body)
            if (!userId) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const response = await this.interactionService.savePost(userId, savePostDTO.postId);
            if(!response?.postIds)
            {
                throw new Error('post ids are undefined')
            }
            const message = response?.postIds.includes(savePostDTO.postId) ? "Post saved" : "Post unsaved!";
            res.status(STATUS_CODES.OK).json({ message });
        } catch (error) {
            next(error);
        }
    }
    public async deletePost(req: Request, res: Response, next: NextFunction) {
        try {
            console.log("REQUEST BODY:", req.body); 
    
            const deletePostDTO=await validateDTO(LikeSavePostDTO,req.body)
            
            const isDeleted = await this.interactionService.deletePost( deletePostDTO.postId);
            console.log("ISDELETED",deletePostDTO.postId)
            if(isDeleted)
            {
                res.status(STATUS_CODES.OK).json({message:"Deleted"})
                return
            }
            else
            {
                res.status(STATUS_CODES.BAD_REQUEST).json({message:"Failed to Delete"})
            }
        } catch (error) {
            next(error);
        }
    }
    public async getSavedPost(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const savedPosts = await this.interactionService.getSavedPost(userId);
            const posts = await PostModel.find({ '_id': { $in: savedPosts?.postIds } });
            res.status(STATUS_CODES.OK).json(posts);
        } catch (error) {
            next(error);
        }
    }
    public async checkSavedStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { postId } = req.params;
            const userId = req.user?.userId;
            if (!userId) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized" });
                return;
            }
            if (!postId) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Post ID missing" });
                return;
            }
            const isSaved = await this.interactionService.checkPostSaved(userId, postId);
            res.status(STATUS_CODES.OK).json({ isSaved });
        } catch (error) {
            next(error);
        }
    }
    public async getComments(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" });
                return;
            }
            const postId = req.query.postId as string;
            if (!postId) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Post ID not provided" });
                return;
            }
            const comments = await this. interactionService.getComments(postId);
            res.status(STATUS_CODES.OK).json(comments);
        } catch (error) {
            next(error);
        }
    }
    public async getPostInteractions(req: Request, res: Response, next: NextFunction) {
        try {
            const postId = req.query.postId as string;
            if (!postId) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Post ID is required" });
                return;
            }
            const interactions = await this.interactionService.getPostInteractions(postId);
            res.status(STATUS_CODES.OK).json({ success: true, interactions });
        } catch (error) {
            next(error);
        }
    }
}
