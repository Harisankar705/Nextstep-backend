import { PostModel } from './../models/post';
import { BaseRepository } from "./baseRepository";  
import { commentModel } from "../models/comment";
import { likeModel } from "../models/like";
import savedPostSchema from "../models/savedPost";
import EmployerModel from "../models/Employer";
import UserModel from "../models/User";
import { ICommentor, IComments, ILike, IPosts } from "../types/authTypes";
import { IInteractionRepository } from '../types/repositoryInterface';
import mongoose from 'mongoose';
export class InteractionRepository extends BaseRepository<IPosts> implements IInteractionRepository  {
    constructor() {
        super(PostModel); 
    }

async createLike(userId: string, postId: string): Promise<ILike | null> {
    const like = await likeModel.create({ userId, postId });

    if (!like) return null;

    return {
        _id: like._id.toString(), 
        userId: like.userId.toString(),
        postId: like.postId.toString(),
        createdAt: like.createdAt,
    };
}

    async removeLike(userId: string, postId: string): Promise<ILike | null> {
        return likeModel.findOneAndDelete({ userId, postId })
    }
    async deletePost( postId: string) {
        const objectId=new mongoose.Types.ObjectId(postId)
        return PostModel.findOneAndDelete({ _id:objectId, })
    }
    
    
    async getLikeCount(postId: string) {
        return likeModel.countDocuments({ postId });
    }
    async savePost(userId: string, postId: string):Promise<IPosts|null> {
        const existingSavedPosts = await savedPostSchema.findOne({ userId });
        if (existingSavedPosts?.postIds.includes(postId)) {
            return await savedPostSchema.findOneAndUpdate(
                { userId },
                { $pull: { postIds: postId } },
                { new: true }
            );
        } else {
            return await savedPostSchema.findOneAndUpdate(
                { userId },
                { $addToSet: { postIds: postId } },
                { new: true, upsert: true }
            );
        }
    }
    async getSavedPost(userId: string):Promise<IPosts|null> {
        return savedPostSchema.findOne({ userId });
    }
    async getCommentCount(postId: string):Promise<number> {
        return commentModel.countDocuments({ postId });
    }
    async checkUserLiked(userId: string, postId: string):Promise<ILike|null> {
        return await likeModel.findOne({ userId, postId });
    }
    async checkSavedPostStatus(userId: string, postId: string):Promise<boolean> {
        const savedPost = await savedPostSchema.findOne({ userId });
        return savedPost ? savedPost.postIds.includes(postId) : false;
    }
    async createComment(
        userId: string,
        postId: string,
        comment: string,
        commentorModel: string
      ): Promise<IComments> {
        const commentDoc = await commentModel.create({ userId, postId, comment, commentorModel });
        return commentDoc.toObject<IComments>(); // Ensures TypeScript compatibility
      }
      
      
      async getComments(postId: string): Promise<IComments[]> {
        const comments = await commentModel.find({ postId }).sort({ createdAt: -1 });
    
        const populatedComments: IComments[] = await Promise.all(
            comments.map(async (comment) => {
                let commentor: ICommentor | null = null;
    
                if (comment.commentorModel === 'Employer') {
                    const employer = await EmployerModel.findById(comment.userId)
                        .select('companyName logo')
                        .lean();
                    if (employer) {
                        commentor = {
                            _id: employer._id.toString(),
                            companyName: employer.companyName,
                            logo: employer.logo
                        };
                    }
                } else {
                    const user = await UserModel.findById(comment.userId)
                        .select('firstName secondName profilePicture')
                        .lean();
                    if (user) {
                        commentor = {
                            _id: user._id.toString(),
                            firstName: user.firstName,
                            secondName: user.secondName,
                            profilePicture: user.profilePicture
                        };
                    }
                }
    
                // Ensure likes match ILike[] structure
                const rawLikes = await likeModel.find({ postId: comment.postId }).lean();
                const likes: ILike[] = rawLikes.map((like) => ({
                    _id: like._id.toString(), // Convert ObjectId to string
                    userId: like.userId.toString(),
                    postId: like.postId.toString(),
                    createdAt: like.createdAt
                }));
    
                return {
                    _id: comment._id.toString(),
                    postId: comment.postId.toString(),
                    userId: comment.userId.toString(),
                    comment: comment.comment,
                    likes, // Now properly typed as ILike[]
                    createdAt: comment.createdAt,
                    commentor
                };
            })
        );
    
        return populatedComments;
    }
    
    
    
    
    
    async getPostById(postId: string) {
        return PostModel.findById(postId);
    }
}
export const interactionRepository = new InteractionRepository();
