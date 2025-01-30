import { NextFunction, Request, Response } from "express";
import { interactionService } from "../services/interactionService";
import { commentModel } from "../models/comment";
import { postModel } from "../models/post";
import { STATUS_CODES } from "../utils/statusCode";
export const likePost=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId=req.user?.userId 
        const {postId}=req.body
        if(!userId)
        {
            res.status(STATUS_CODES.UNAUTHORIZED).json({message:"unauthorized"})
        }
        const isLiked=await interactionService.likePost(userId,postId)
        res.status(STATUS_CODES.OK).json({success:true,isLiked,message:isLiked?"Post liked":"Post unliked"})
    } catch (error) {
        next(error)
    }
}
export const commentPost=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId=req.user?.userId  
        const { postId, comment }=req.body
        if (!userId) {
            res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" })
        }
        const comments = await interactionService.commentOnPost(userId, postId, comment)
        const populatedComment=await commentModel.findById(comments._id).populate('userId')
        res.status(STATUS_CODES.CREATED).json({success:true,comment:populatedComment,message:"comment added successfully"})
    } catch (error) {
        next(error)
    }
}
export const getPost=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId=req.user?.userId
        if(!userId)
        {
            res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" })
            return
        }
        const posts=await interactionService.getPosts(userId)
        res.status(STATUS_CODES.OK).json({posts})
    } catch (error) {
        next(error)
    }
}
export const sharePost=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId=req.user?.userId  
        const {postId}=req.body
        if (!userId) {
            res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" })
        }
        const share=await interactionService.sharePost(userId,postId)
        res.status(STATUS_CODES.CREATED).json({ success: true, share,message:"comment added successfully"})
    } catch (error) {
        next(error)
    }
}
export const savePost=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId=req.user?.userId
        if(!userId)
        {
            res.status(STATUS_CODES.UNAUTHORIZED).json({message:"unauthorized"})
            return
        }
        const {postId}=req.body
        if(!postId)
        {
            res.status(STATUS_CODES.BAD_REQUEST).json({message:"Postid is required!"})
            return
        }
        const response=await interactionService.savePost(userId,postId)
        const message=response?.postIds.includes(postId)?"Post saved":"Post unsaved!"
        res.status(STATUS_CODES.OK).json({message})
    } catch (error) {
        next(error)
    }
}
export const getSavedPost=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId=req.user?.userId
        if(!userId)
        {
            res.status(STATUS_CODES.UNAUTHORIZED).json({message:"unauthorized"})
            return
        }
        const savedPosts=await interactionService.getSavedPost(userId)
        const posts=await postModel.find({'_id':{$in:savedPosts?.postIds}})
        res.status(STATUS_CODES.OK).json(posts)
    } catch (error) {
        next(error)
    }
}
export const checkSavedStatus=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {postId}=req.params
        const userId=req.user?.userId
        if(!userId)
        {
            res.status(STATUS_CODES.UNAUTHORIZED).json({message:"Unauthorized"})
            return
        }
        if(!postId)
        {
            res.status(STATUS_CODES.BAD_REQUEST).json({message:"Postid missing"})
            return
        }
        const isSaved=await interactionService.checkPostSaved(userId,postId)
        res.status(STATUS_CODES.OK).json({ isSaved });
    } catch (error) {
        next(error)
    }
}
export const getComments=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId=req.user?.userId 
        if (!userId) {
            res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "unauthorized" })
        }
        const postId=req.query.postId as string
        if(!postId)
        {
            res.status(STATUS_CODES.BAD_REQUEST).json({messsage:"Post id not provided"})
        }
        const comments=await interactionService.getComments(postId)
        res.status(STATUS_CODES.OK).json(comments)
    } catch (error) {
        next(error)
    }
}
export const getPostInteractions=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId = req.user?.userId  
        const postId = req.query.postId as string
        if (!postId) {
            res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "post Id not there" })
        }
        const interactions = await interactionService.getPostInteractions(postId)
        res.status(STATUS_CODES.CREATED).json({ success: true, interactions})
    } catch (error) {
        next(error)
    }
}
