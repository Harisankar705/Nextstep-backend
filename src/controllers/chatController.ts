import { Request, Response } from "express"
import { ChatService } from "../services/chatService"
const chatService = new ChatService();


export const sendMessage=async(req:Request,res:Response)=>{
try {
    const {sender,receiver,content}=req.body
    if(!sender||!receiver||!content)
    {
        res.status(400).json({message:"All fields are required!"})
    }
    const message=await chatService.sendMessage({sender,receiver,content})
    res.status(200).json(message)
} catch (error) {
    res.status(500).json({error:error})
}
}
export const getChat=async(req:Request,res:Response)=>{
    try {
        const {user1,user2}=req.params
        const messages=await chatService.getChat(user1,user2)
        res.status(201).json(messages)
    } catch (error) {
        res.status(500).json({error:error})
    }
}
export const getMessages=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId
        console.log('userid',userId)
        const messages=await chatService.getMessagesForUser(userId)
        console.log('messages',messages)
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json(error)
    }
}