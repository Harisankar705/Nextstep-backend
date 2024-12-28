import { Request, Response } from "express";
import { interactionService } from "../services/interactionService";
import { commentModel } from "../models/comment";

export const likePost=async(req:Request,res:Response)=>{
    try {
        console.log('in likepost')
        const userId=req.user?.userId 
        const {postId}=req.body
        if(!userId)
        {
            res.status(401).json({message:"unauthorized"})
        }
        console.log(userId)
        console.log("POSTID",postId)
        const isLiked=await interactionService.likePost(userId,postId)
        console.log("ISLIKED",isLiked)
        res.status(200).json({success:true,isLiked,message:isLiked?"Post liked":"Post unliked"})
    } catch (error) {
        const err = error as Error;
        console.log(err.message)
        res.status(400).json({ message: err.message });
    }
}
export const commentPost=async(req:Request,res:Response)=>{
    try {
        console.log("IN COMMENTPOST")
        const userId=req.user?.userId  
        const { postId, comment }=req.body
        console.log(userId)
        console.log(postId)
        console.log(comment)
        if (!userId) {
            res.status(401).json({ message: "unauthorized" })
        }
        const comments = await interactionService.commentOnPost(userId, postId, comment)
        const populatedComment=await commentModel.findById(comments._id).populate('userId')
        console.log("COMMENTS",comments)
        res.status(201).json({success:true,comment:populatedComment,message:"comment added successfully"})
    } catch (error) {
        console.log('failed to add comment',error)
        res.status(500).json({success:false,message:"Failed to add comment"})
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
export const getComments=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId 
        if (!userId) {
            res.status(401).json({ message: "unauthorized" })
            
        }
        console.log("USERID",userId)
        
        const postId=req.query.postId as string
        console.log("POSTID", postId)
        if(!postId)
        {
            res.status(400).json({messsage:"Post id not provided"})
        }
        const comments=await interactionService.getComments(postId)
        res.status(200).json({message:"success",data:comments})

    } catch (error) {
        console.log("ERROR in getcomments",error)
        res.status(500).json({ success: false, message: "Error occured in getcomments" })
    }
}
export const getPostInteractions=async(req:Request,res:Response)=>{
    try {
        const userId = req.user?.userId  
        console.log('in get post')

        const postId = req.query.postId as string
        if (!postId) {
            res.status(401).json({ message: "post Id not there" })
        }
        const interactions = await interactionService.getPostInteractions(postId)
        console.log('interactions',interactions)
        
        res.status(201).json({ success: true, interactions})
    } catch (error) {
        res.status(500).json({success:false,message:"Failed to get postInteractions"})
    }
}
