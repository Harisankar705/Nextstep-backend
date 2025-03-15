import { Server } from "socket.io";
import {  PostModel } from "../models/post";
import { InteractionRepository } from "../repositories/interactionRepository";
import { NotificationService } from "./notificationService";
import { getSenderData } from "../utils/modelUtil";
import ConnectionModel from "../models/connection";
import { inject, LazyServiceIdentifier } from "inversify";
import notificationModel from '../models/notification';
import { TYPES } from "../types/types";
import { SocketHandler } from "../utils/socketConfig";
import UserModel from "../models/User";
export class InteractionService  {
    private io:Server
    constructor(@inject(TYPES.InteractionRepository)private interactionRepository:InteractionRepository,@inject(TYPES.NotificationService)private notificationService:NotificationService,@inject(TYPES.SocketServer)private socketServer:Server,
    @inject(new LazyServiceIdentifier(()=> TYPES.SocketHandler))private socketHandler:SocketHandler)
    {
        this.io=socketServer
    }
    async likePost(userId: string, postId: string): Promise<boolean> {
        try {
            console.log('in createlike')
            const existingLike = await this.interactionRepository.checkUserLiked(userId, postId);
            const post=await this.interactionRepository.getPostById(postId)
            const sender=await UserModel.findById(userId)
            if(!post)throw new Error("Post not found!")
            if(!sender)throw new Error("User not found!")
            if(existingLike)
            {
                await this.interactionRepository.removeLike(userId,postId)
                return false
            }
            await this.interactionRepository.createLike(userId,postId)
            if(post?.userId.toString()!==userId.toString())
            {
                const recipientId=post?.userId.toString()
                const notificationData={
                    recipientId,
                    sender:userId,
                    type:'post_like',   
                    content:`${sender.firstName} liked your post!`,
                    link:`/candidate-profile/${recipientId}`
                }
                await notificationModel.create(notificationData)
                this.socketHandler.emitNotification(post.userId.toString(),{
                    sender:sender.firstName,
                    receipientId:post?.userId,
                    content:`${sender?.firstName} send you a connection request!`,
                    link:'/posts/${postId}'
                })
            }
           return true
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
        if(!sender)
        {
            throw new Error("User not found!")
        }
        const commentorModel = sender?.role === 'employer' ? 'Employer' : 'User';
        if(!commentorModel )
        {
            throw new Error("Commentor Model not found")
        }
        const comments = await this.interactionRepository.createComment(userId, postId,comment, commentorModel)
        const updatedPost=await PostModel.findByIdAndUpdate(postId,{
            $inc:{commentCount:1},
            $push:{comments:comments._id}
        },{new:true})
        const post=await PostModel.findById(postId)
        if(!post)
        {
            throw new Error("Post not found")
        }
        const senderName=sender.role==='employer'?sender.companyName:`${sender.firstName}`
        const content=`${senderName} commented on your post!`
        if(post?.userId.toString()!==userId.toString())
        {
            const recipientId=post?.userId.toString()
                const notificationData={
                    recipientId,
                    sender:userId,
                    comment:comment,
                    type:'post_comment',
                    content,
                    link:`/candidate-profile/${recipientId}`
                }
                await notificationModel.create(notificationData)
                this.socketHandler.emitNotification(post.userId.toString(),{
                    sender:sender,
                    recipientId:post?.userId,
                    content,
                    link:`/candidate-profile/${recipientId}`
                })        
            }
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
        console.log("CONNECTIONS",connections)
        const followingIds=connections.map(connection=>connection.followingId)
        console.log(followingIds)
        const posts=await PostModel.find({userId:{$in:followingIds}})
        .populate('userId', 'firstName secondName profilePicture') 
        .sort({createdAt:1})
        console.log("POSTS",posts)
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