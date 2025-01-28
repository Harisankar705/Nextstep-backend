import { Request, Response } from "express";
import { interactionService } from "../services/interactionService";
import { commentModel } from "../models/comment";
import { Result } from "express-validator";
import { postModel } from "../models/post";
export const likePost=async(req:Request,res:Response)=>{
    try {
        console.log('in like post')
        const userId=req.user?.userId 
        const {postId}=req.body
        if(!userId)
        {
            res.status(401).json({message:"unauthorized"})
        }
        const isLiked=await interactionService.likePost(userId,postId)
        res.status(200).json({success:true,isLiked,message:isLiked?"Post liked":"Post unliked"})
    } catch (error) {
        const err = error as Error;
        res.status(400).json({ message: err.message });
    }
}
export const commentPost=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId  
        const { postId, comment }=req.body
        if (!userId) {
            res.status(401).json({ message: "unauthorized" })
        }
        const comments = await interactionService.commentOnPost(userId, postId, comment)
        const populatedComment=await commentModel.findById(comments._id).populate('userId')
        res.status(201).json({success:true,comment:populatedComment,message:"comment added successfully"})
    } catch (error) {
        res.status(500).json({success:false,message:"Failed to add comment"})
    }
}
export const getPost=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId
        if(!userId)
        {
            res.status(401).json({ message: "unauthorized" })
            return
        }
        const posts=await interactionService.getPosts(userId)
        res.status(200).json({posts})
    } catch (error) {
        console.log('error occured in getpost',error)
        res.status(500).json({ success: false, message: "Failed to share post" })
        return

    }
}
export const sharePost=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId  
        const {postId}=req.body
        if (!userId) {
            res.status(401).json({ message: "unauthorized" })
        }
        const share=await interactionService.sharePost(userId,postId)
        res.status(201).json({ success: true, share,message:"comment added successfully"})
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to share post" })
    }
}
export const savePost=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId
        if(!userId)
        {
            res.status(401).json({message:"unauthorized"})
            return
        }
        const {postId}=req.body
        if(!postId)
        {
            res.status(400).json({message:"Postid is required!"})
            return
        }
        const response=await interactionService.savePost(userId,postId)
        const message=response?.postIds.includes(postId)?"Post saved":"Post unsaved!"
        res.status(200).json({message})
    } catch (error) {
        const err=error as Error
        res.status(400).json({message:err.message})
    }
}
export const getSavedPost=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId
        if(!userId)
        {
            res.status(401).json({message:"unauthorized"})
            return
        }
        const savedPosts=await interactionService.getSavedPost(userId)
        const posts=await postModel.find({'_id':{$in:savedPosts?.postIds}})
        res.status(200).json(posts)
    } catch (error) {
        const err=error as Error
        res.status(400).json({message:err.message})
    }
}
export const checkSavedStatus=async(req:Request,res:Response)=>{
    try {
        const {postId}=req.params
        const userId=req.user?.userId
        if(!userId)
        {
            res.status(401).json({message:"Unauthorized"})
            return
        }
        if(!postId)
        {
            res.status(400).json({message:"Postid missing"})
            return
        }
        const isSaved=await interactionService.checkPostSaved(userId,postId)
        res.status(200).json({ isSaved });
    } catch (error) {
        const err=error as Error
        res.status(400).json({message:err.message})
    }
}
export const getComments=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId 
        if (!userId) {
            res.status(401).json({ message: "unauthorized" })
        }
        const postId=req.query.postId as string
        if(!postId)
        {
            res.status(400).json({messsage:"Post id not provided"})
        }
        const comments=await interactionService.getComments(postId)
        res.status(200).json(comments)
    } catch (error) {
        res.status(500).json({ success: false, message: "Error occured in getcomments" })
    }
}
export const getPostInteractions=async(req:Request,res:Response)=>{
    try {
        const userId = req.user?.userId  
        const postId = req.query.postId as string
        if (!postId) {
            res.status(401).json({ message: "post Id not there" })
        }
        const interactions = await interactionService.getPostInteractions(postId)
        res.status(201).json({ success: true, interactions})
    } catch (error) {
        res.status(500).json({success:false,message:"Failed to get postInteractions"})
    }
}
