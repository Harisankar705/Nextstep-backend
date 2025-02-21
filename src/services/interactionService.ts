import { Server } from "socket.io";
import {  PostModel } from "../models/post";
import { InteractionRepository } from "../repositories/interactionRepository";
import { NotificationService } from "./notificationService";
import { getSenderData } from "../utils/modelUtil";
import ConnectionModel from "../models/connection";
import { inject } from "inversify";
import { TYPES } from "../types/types";
export class InteractionService  {
    private io:Server
    constructor(@inject(TYPES.InteractionRepository)private interactionRepository:InteractionRepository,@inject(TYPES.NotificationService)private notificationService:NotificationService,@inject(TYPES.SocketServer)private socketServer:Server)
    {
        this.io=socketServer
    }
    async likePost(userId: string, postId: string): Promise<boolean> {
        try {
            console.log('in createlike')
            const existingLike = await this.interactionRepository.checkUserLiked(userId, postId);
            const post=await this.interactionRepository.getPostById(postId)
            if(post?.userId.toString()!==userId.toString())
            {
                const recipientId=post?.userId.toString()
                const notificationData={
                    recipientId,
                    senderId:userId,
                    type:'post_like',   
                    content:'liked your post',
                    link:`/posts/${postId}`
                }
                await this.notificationService.createNotification(notificationData)
            }
            if (existingLike) {
                await this.interactionRepository.removeLike(userId, postId);
                await PostModel.findByIdAndUpdate(postId, {
                    $inc: { likeCount: -1 },
                    $pull: { likes: existingLike._id }  
                });
                return false;
            } else {
                const like = await this.interactionRepository.createLike(userId, postId);
                await PostModel.findByIdAndUpdate(postId, {
                    $inc: { likeCount: 1 },
                    $push: { likes: like?._id }  
                });
                this.io.to(postId).emit('likePost',{postId,userId,like})
                return true;
            }
        } catch (error) {
            throw error;
        }
    }
    async getPostById(postId:string)
    {
        return await PostModel.findById(postId)
    }
    async commentOnPost(userId: string, postId: string, comment:string)
    {
        if (!comment.trim())
        {
            throw new Error("Comment cannot be empty!")
        }
        const sender=await getSenderData(userId)
                    const commentorModel = sender?.role === 'employer' ? 'Employer' : 'User';
        const comments = await this.interactionRepository.createComment(userId, postId,comment, commentorModel)
        const updatedPost=await PostModel.findByIdAndUpdate(postId,{
            $inc:{commentCount:1},
            $push:{comments:comments._id}
        },{new:true})
        const post=await PostModel.findById(postId)
        if(post?.userId.toString()!==userId.toString())
        {
            const recipientId=post?.userId.toString()
                const notificationData={
                    recipientId,
                    senderId:userId,
                    comment:comment,
                    type:'post_comment',
                    content:'commented on your post',
                    link:`/posts/${postId}`
                }
                await this.notificationService.createNotification(notificationData)
        }
        this.io.to(postId).emit('newComment',{postId,comment:comments})
        return comments
    }
    // async sharePost(userId:string,postId:string)
    // {
    //     const share=await interactionRepository.createShare(userId,postId)
    //     await PostModel.findByIdAndUpdate(postId,{
    //         $inc:{shareCount:1}
    //     })
    //     return share
    // }
    async getPosts(userId:string)
    {
        const connections=await ConnectionModel.find({followerId:userId})
        const followingIds=connections.map(connection=>connection.followingId)
        const posts=await PostModel.find({userId:{$in:followingIds}})
        .populate('userId', 'firstName secondName profilePicture') 
        .sort({createdAt:1})
        return posts
    }
    async getComments(postId:string)
    {
        const comments=await this.interactionRepository.getComments(postId)
        return comments
    }
    async savePost(userId:string,postId:string)
    {
        const savedPost=await this.interactionRepository.savePost(userId,postId)
        return savedPost
    }
    async deletePost(postId:string)
    {
        const deletePost=await this.interactionRepository.deletePost(postId)
        return deletePost
    }
    async getSavedPost(userId:string)
    {
        const savedPost=await this.interactionRepository.getSavedPost(userId)
        return savedPost
    } 
     async checkPostSaved (userId:string,postId:string)
     {
        return await this.interactionRepository.checkSavedPostStatus(userId,postId)
     }
    async getPostInteractions(postId:string)
    {
        const [likeCount,commentCount]=await Promise.all([
            this.interactionRepository.getLikeCount(postId),
            this.interactionRepository.getCommentCount(postId)
        ])
        return {
            likeCount,
            commentCount,
        }
    }
}