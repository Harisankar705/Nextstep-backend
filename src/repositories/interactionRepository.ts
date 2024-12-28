import { commentModel } from "../models/comment"
import { likeModel } from "../models/like"

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
    async getCommentCount(postId:string)
    {
        return commentModel.countDocuments({postId})
    }
    async checkUserLiked(userId:string,postId:string)
    {
        return likeModel.exists({userId,postId})
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
    


}
export const interactionRepository=new InteractionRepository()