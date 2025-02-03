import { Server } from "socket.io";
import {  postModel } from "../models/post";
import { InteractionRepository, interactionRepository } from "../repositories/interactionRepository";
import { notificationService } from "./notificationService";
import { getSenderData } from "../utils/modelUtil";
import ConnectionModel from "../models/connection";
class InteractionService{
    private io:Server
    private interactionRepository:InteractionRepository
    private notificationService:NotificationService
    constructor(io:Server,interactionRepository:InteractionRepository,notificationService:NotificationService)
    {
        this.io=io;
        this.interactionRepository=interactionRepository;
        this.notificationService=notificationService;
    }
    async likePost(userId: string, postId: string): Promise<boolean|any> {
        try {
            const existingLike = await interactionRepository.checkUserLiked(userId, postId);
            const post=await interactionRepository.getPostById(postId)
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
                this.io.to(postId).emit('likePost',{postId,userId,like})
                return true;
            }
        } catch (error) {
            throw error;
        }
    }
    async commentOnPost(userId: string, postId: string, comment:string)
    {
        if (!comment.trim())
        {
            throw new Error("Comment cannot be empty!")
        }
        const sender=await getSenderData(userId)
                    const commentorModel = sender?.role === 'employer' ? 'Employer' : 'User';
        const comments = await interactionRepository.createComment(userId, postId,comment, commentorModel)
        const updatedPost=await postModel.findByIdAndUpdate(postId,{
            $inc:{commentCount:1},
            $push:{comments:comments._id}
        },{new:true})
        const post=await postModel.findById(postId)
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
                await notificationService.createNotification(notificationData)
        }
        this.io.to(postId).emit('newComment',{postId,comment:comments})
        return comments
    }
    // async sharePost(userId:string,postId:string)
    // {
    //     const share=await interactionRepository.createShare(userId,postId)
    //     await postModel.findByIdAndUpdate(postId,{
    //         $inc:{shareCount:1}
    //     })
    //     return share
    // }
    async getPosts(userId:string)
    {
        const connections=await ConnectionModel.find({followerId:userId})
        const followingIds=connections.map(connection=>connection.followingId)
        const posts=await postModel.find({userId:{$in:followingIds}})
        .populate('userId', 'firstName secondName profilePicture') 
        .sort({createdAt:1})
        return posts
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
const io=new Server
export const interactionService=new InteractionService(io,interactionRepository,notificationService)