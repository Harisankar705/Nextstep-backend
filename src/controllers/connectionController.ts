import { ConnectionService } from './../services/connectionService';
import { Response } from 'express';
import { Request } from 'express';
import { ConnectionStatus } from '../types/authTypes';
const connectionService = new ConnectionService()
export const followUser = async (req: Request, res: Response) => {
    try {
        
        const { followingId } = req.body
        const followerId = req.user?.userId
        if (!followerId || !followingId) {
            res.status(401).json({ message: "Authentication required!" })
            return
        }
        const connection = await connectionService.followUser(
            followerId, followingId
        )
        
        res.status(200).json({ success: true, data: connection })
        return
    } catch (error) {
        const err = error as Error;
        
        res.status(400).json({ message: err.message });
        return
    }
}
export const followBack=async(req:Request,res:Response)=>{
    try {
        const {connectionId}=req.body
        
        
        const userId=req.user?.userId 
        
        

        if (!userId || !connectionId)
        {
            res.status(401).json({message:"authentication required"})
            return
        }
        const connection = await connectionService.respondToRequest(userId, connectionId,ConnectionStatus.FOLLOWBACK)
        
        if(!connection)
        {
            res.status(404).json({message:"Connection request not found"})
            return
        }
        res.status(200).json({success:true,data:connection})
    } catch (error) {
        const err = error as Error;
        
        res.status(400).json({ message: err.message });
        return
    }
}
export const respontToRequest = async (req: Request, res: Response) => {
    try {
        const { connectionId, status } = req.body
        const userId = req.user?.userId
        if (!userId) {
            res.status(401).json({ message: "Authentication required" })
            return 
        }
        if (!connectionId) {
             res.status(400).json({ message: "Invalid connection Id" })
            return 
        }
        const connection = await connectionService.respondToRequest(
            connectionId, userId, status
        )
    } catch (error) {
        const err = error as Error;
        
        res.status(400).json({ message: err.message });
    }
}
export const getConnections = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId
        if (!userId) {
            res.status(401).json({ message: "Authentication required!" })
            return
        }
        const connections = await connectionService.getConnections(userId)
         res.status(200).json({ data: connections })
        return
    } catch (error) {
        const err = error as Error;
        
        res.status(400).json({ message: err.message });
    }
}
export const getMutualConnections = async (req: Request, res: Response) => {
    try {
        const { targetUserId } = req.params
        const userId = req.user?.userId
        if (!targetUserId || !userId) {
             res.status(401).json({ message: "data not found in params" })
            return
        }
        const mutualConnections = await connectionService.getMutualConnections(userId, targetUserId)
        res.status(200).json({ data: mutualConnections })
        return
    } catch (error) {
        const err = error as Error;
        
        res.status(400).json({ message: err.message });
    }

}
export const checkFollowStatus=async(req:Request,res:Response)=>{
    
    const currentUser=req.user?.userId
    const checkUser=req.query.followingId as string
    
    
    if(!currentUser|| !checkUser)
    {
        res.status(401).json({message:`${currentUser} id is undefined`})
        return 
    }
    try {
        const isFollowing = await connectionService.checkFollowStatus(currentUser, checkUser)
        res.status(200).json({isFollowing})
    } catch (error) {
        const err = error as Error;
        
        res.status(400).json({ message: err.message });
    }
   
}
export const pendingRequests=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId 
        if(!userId)
        {
            res.status(401).json({message:"Unauthorized"})
        }
        
        const requests=await connectionService.getPendingRequest(userId)
        
        res.status(200).json(requests)
    } catch (error) {
        const err = error as Error;
        
        res.status(400).json({ message: err.message });
    }
}