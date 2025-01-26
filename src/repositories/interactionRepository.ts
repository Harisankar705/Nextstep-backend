import { commentModel } from "../models/comment"
import { likeModel } from "../models/like"
import { postModel } from "../models/post"
import savedPostSchema from "../models/savedPost"

class InteractionRepository
{
    async createLike(userId:string,postId:string)
    {
        return likeModel.create({userId,postId})
    }
    async removeLike(userId:string,postId:string)
    {
        return likeModel.findOneAndDelete({userId,postId})
    }
    async getLikeCount(postId:string)
    {
        return likeModel.countDocuments({postId})
    }
    async savePost(userId:string,postId:string)
    {
        const exisitingSavedPosts=await savedPostSchema.findOne({userId})
        if(exisitingSavedPosts?.postIds.includes(postId))
        {
            return await savedPostSchema.findOneAndUpdate({userId},{$pull:{postIds:postId}},{new:true})
        }
        else
        {
            return await savedPostSchema.findOneAndUpdate({userId},{$addToSet:{postIds:postId}},{new:true,upsert:true})
        }
    }
    async getSavedPost(userId:string)
    {
        return savedPostSchema.findOne({userId:userId})
    }
    async getCommentCount(postId:string)
    {
        return commentModel.countDocuments({postId})
    }
    async checkUserLiked(userId:string,postId:string)
    {
        return likeModel.exists({userId,postId})
    }
    async checkSavedPostStatus(userId:string,postId:string)
    {
        const savedPost=await savedPostSchema.findOne({userId})
        return savedPost ?savedPost.postIds.includes(postId):false
    }
    async createComment(userId: string, postId: string, comment:string)
    {
        return commentModel.create({ userId, postId, comment })
    }
    // async getShareCount(postId:string)
    // {
    //     return sharemodel.countDocuments({postId})
    // }
    async getComments(postId:string)
    {
        return commentModel.find({postId})
        .populate('userId','firstName secondName profilePicture')
        .sort({createdAt:-1})
    }
    async createShare(userId:string,postId:string)
    {
        return likeModel.create({userId,postId})
    }
    async getPostById(postId:string)
    {
        return postModel.findById(postId)
    }
    


}
export const interactionRepository=new InteractionRepository()