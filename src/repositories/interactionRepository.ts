import { BaseRepository } from "./baseRepository";  
import { commentModel } from "../models/comment";
import { likeModel } from "../models/like";
import savedPostSchema from "../models/savedPost";
import EmployerModel from "../models/Employer";
import UserModel from "../models/User";
import { postModel } from "../models/post";
export class InteractionRepository extends BaseRepository<any>  {
    constructor() {
        super(postModel); 
    }
    async createLike(userId: string, postId: string) {
        return likeModel.create({ userId, postId });
    }
    async removeLike(userId: string, postId: string) {
        return likeModel.findOneAndDelete({ userId, postId });
    }
    async getLikeCount(postId: string) {
        return likeModel.countDocuments({ postId });
    }
    async savePost(userId: string, postId: string) {
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
    async getSavedPost(userId: string) {
        return savedPostSchema.findOne({ userId });
    }
    async getCommentCount(postId: string) {
        return commentModel.countDocuments({ postId });
    }
    async checkUserLiked(userId: string, postId: string) {
        return likeModel.exists({ userId, postId });
    }
    async checkSavedPostStatus(userId: string, postId: string) {
        const savedPost = await savedPostSchema.findOne({ userId });
        return savedPost ? savedPost.postIds.includes(postId) : false;
    }
    async createComment(userId: string, postId: string, comment: string, commentorModel: string) {
        return commentModel.create({ userId, postId, comment, commentorModel });
    }
    async getComments(postId: string) {
        const comments = await commentModel.find({ postId }).sort({ createdAt: -1 });
        const populatedComments = await Promise.all(
            comments.map(async (comment) => {
                if (comment.commentorModel === 'Employer') {
                    const commentor = await EmployerModel.findById(comment.userId).select('companyName logo');
                    return { ...comment.toObject(), commentor };
                } else {
                    const commentor = await UserModel.findById(comment.userId).select('firstName secondName profilePicture');
                    return { ...comment.toObject(), commentor };
                }
            })
        );
        return populatedComments;
    }
    async createShare(userId: string, postId: string) {
        return likeModel.create({ userId, postId });
    }
    async getPostById(postId: string) {
        return postModel.findById(postId);
    }
}
export const interactionRepository = new InteractionRepository();
