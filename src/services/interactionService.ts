import {  postModel } from "../models/post";
import { interactionRepository } from "../repositories/interactionRepository";
import { notificationService } from "./notificationService";

class InteractionService{
    async likePost(userId: string, postId: string): Promise<boolean> {
        try {
            const existingLike = await interactionRepository.checkUserLiked(userId, postId);
            const post=await interactionRepository.getPostById(postId)
            if(post?.userId.toString()!==userId.toString())
            {
                const notificationData={
                    recipient:post?.userId,
                    sender:userId,
                    type:'post_like',
                    content:'liked your post',
                    link:`/posts/${userId}`
                }
                await notificationService.createNotification(notificationData)
            }

            if (existingLike) {
                await interactionRepository.removeLike(userId, postId);
                await postModel.findByIdAndUpdate(postId, {
                    $inc: { likeCount: -1 },
                    $pull: { likes: existingLike._id }  
                });
                return false;
            } else {
                const like = await interactionRepository.createLike(userId, postId);
                await postModel.findByIdAndUpdate(postId, {
                    $inc: { likeCount: 1 },
                    $push: { likes: like._id }  
                });
                return true;
            }
        } catch (error) {
            console.error('Error in likePost:', error);
            throw error;
        }
    }

    async commentOnPost(userId: string, postId: string, comment:string)
    {
        if (!comment.trim())
        {
            throw new Error("Comment cannot be empty!")
        }
        const comments = await interactionRepository.createComment(userId, postId, comment)
        const updatedPost=await postModel.findByIdAndUpdate(postId,{
            $inc:{commentCount:1},
            $push:{comments:comments._id}
        },{new:true})
        return comments
    }
    async sharePost(userId:string,postId:string)
    {
        const share=await interactionRepository.createShare(userId,postId)
        await postModel.findByIdAndUpdate(postId,{
            $inc:{shareCount:1}
        })
        return share
    }
    async getComments(postId:string)
    {
        const comments=await interactionRepository.getComments(postId)
        return comments
    }
    async savePost(userId:string,postId:string)
    {
        const savedPost=await interactionRepository.savePost(userId,postId)
        return savedPost
    }
    async getSavedPost(userId:string)
    {
        const savedPost=await interactionRepository.getSavedPost(userId)
        return savedPost
    } 
     async checkPostSaved (userId:string,postId:string)
     {
        return await interactionRepository.checkSavedPostStatus(userId,postId)

     }

    
    async getPostInteractions(postId:string)
    {
        const [likeCount,commentCount]=await Promise.all([
            interactionRepository.getLikeCount(postId),
            interactionRepository.getCommentCount(postId)
            
        ])
        return {
            likeCount,
            commentCount,
            
        }
    }
}
export const interactionService=new InteractionService()