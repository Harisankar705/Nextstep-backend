"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactionRepository = exports.InteractionRepository = void 0;
const post_1 = require("./../models/post");
const baseRepository_1 = require("./baseRepository");
const comment_1 = require("../models/comment");
const like_1 = require("../models/like");
const savedPost_1 = __importDefault(require("../models/savedPost"));
const Employer_1 = __importDefault(require("../models/Employer"));
const User_1 = __importDefault(require("../models/User"));
const mongoose_1 = __importDefault(require("mongoose"));
class InteractionRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(post_1.PostModel);
    }
    async createLike(userId, postId) {
        const like = await like_1.likeModel.create({ userId, postId });
        if (!like)
            return null;
        return {
            _id: like._id.toString(),
            userId: like.userId.toString(),
            postId: like.postId.toString(),
            createdAt: like.createdAt,
        };
    }
    async removeLike(userId, postId) {
        return like_1.likeModel.findOneAndDelete({ userId, postId });
    }
    async deletePost(postId) {
        const objectId = new mongoose_1.default.Types.ObjectId(postId);
        return post_1.PostModel.findOneAndDelete({ _id: objectId, });
    }
    async getLikeCount(postId) {
        return like_1.likeModel.countDocuments({ postId });
    }
    async savePost(userId, postId) {
        const existingSavedPosts = await savedPost_1.default.findOne({ userId });
        if (existingSavedPosts?.postIds.includes(postId)) {
            return await savedPost_1.default.findOneAndUpdate({ userId }, { $pull: { postIds: postId } }, { new: true });
        }
        else {
            return await savedPost_1.default.findOneAndUpdate({ userId }, { $addToSet: { postIds: postId } }, { new: true, upsert: true });
        }
    }
    async getSavedPost(userId) {
        return savedPost_1.default.findOne({ userId });
    }
    async getCommentCount(postId) {
        return comment_1.commentModel.countDocuments({ postId });
    }
    async checkUserLiked(userId, postId) {
        return await like_1.likeModel.findOne({ userId, postId });
    }
    async checkSavedPostStatus(userId, postId) {
        const savedPost = await savedPost_1.default.findOne({ userId });
        return savedPost ? savedPost.postIds.includes(postId) : false;
    }
    async createComment(userId, postId, comment, commentorModel) {
        const commentDoc = await comment_1.commentModel.create({ userId, postId, comment, commentorModel });
        return commentDoc.toObject(); // Ensures TypeScript compatibility
    }
    async getComments(postId) {
        const comments = await comment_1.commentModel.find({ postId }).sort({ createdAt: -1 });
        const populatedComments = await Promise.all(comments.map(async (comment) => {
            let commentor = null;
            if (comment.commentorModel === 'Employer') {
                const employer = await Employer_1.default.findById(comment.userId)
                    .select('companyName logo')
                    .lean();
                if (employer) {
                    commentor = {
                        _id: employer._id.toString(),
                        companyName: employer.companyName,
                        logo: employer.logo
                    };
                }
            }
            else {
                const user = await User_1.default.findById(comment.userId)
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
            const rawLikes = await like_1.likeModel.find({ postId: comment.postId }).lean();
            const likes = rawLikes.map((like) => ({
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
        }));
        return populatedComments;
    }
    async getPostById(postId) {
        return post_1.PostModel.findById(postId);
    }
}
exports.InteractionRepository = InteractionRepository;
exports.interactionRepository = new InteractionRepository();
