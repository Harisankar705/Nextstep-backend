import { ConnectionService } from './../services/connectionService';
import { NextFunction, Response } from 'express';
import { Request } from 'express';
import { ConnectionStatus } from '../types/authTypes';
import { STATUS_CODES } from '../utils/statusCode';
const connectionService = new ConnectionService()
export const followUser = async (req: Request, res: Response,next:NextFunction) => {
    try {
        const { followingId } = req.body
        const followerId = req.user?.userId
        if (!followerId || !followingId) {
            res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Authentication required!" })
            return
        }
        const connection = await connectionService.followUser(
            followerId, followingId
        )
        res.status(STATUS_CODES.OK).json({ success: true, data: connection })
        return
    } catch (error) {
        next(error)
    }
}
export const followBack=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {connectionId}=req.body
        const userId=req.user?.userId 
        if (!userId || !connectionId)
        {
            res.status(STATUS_CODES.UNAUTHORIZED).json({message:"authentication required"})
            return
        }
        const connection = await connectionService.respondToRequest(userId, connectionId,ConnectionStatus.FOLLOWBACK)
        if(!connection)
        {
            res.status(STATUS_CODES.NOT_FOUND).json({message:"Connection request not found"})
            return
        }
        res.status(STATUS_CODES.OK).json({success:true,data:connection})
    } catch (error) {
        next(error)
    }
}
export const respontToRequest = async (req: Request, res: Response,next:NextFunction) => {
    try {
        const { connectionId, status } = req.body
        const userId = req.user?.userId
        if (!userId) {
            res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Authentication required" })
            return 
        }
        if (!connectionId) {
             res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid connection Id" })
            return 
        }
        const connection = await connectionService.respondToRequest(
            connectionId, userId, status
        )
    } catch (error) {
        next(error)
    }
}
export const getConnections = async (req: Request, res: Response,next:NextFunction) => {
    try {
        const userId = req.user?.userId
        if (!userId) {
            res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Authentication required!" })
            return
        }
        const connections = await connectionService.getConnections(userId)
         res.status(STATUS_CODES.OK).json({ data: connections })
        return
    } catch (error) {
        next(error)
    }
}
export const getMutualConnections = async (req: Request, res: Response,next:NextFunction) => {
    try {
        const { targetUserId } = req.params
        const userId = req.user?.userId
        if (!targetUserId || !userId) {
             res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "data not found in params" })
            return
        }
        const mutualConnections = await connectionService.getMutualConnections(userId, targetUserId)
        res.status(STATUS_CODES.OK).json({ data: mutualConnections })
        return
    } catch (error) {
        next(error)
    }
}
export const checkFollowStatus=async(req:Request,res:Response,next:NextFunction)=>{
    const currentUser=req.user?.userId
    const checkUser=req.query.followingId as string
    if(!currentUser|| !checkUser)
    {
        res.status(STATUS_CODES.UNAUTHORIZED).json({message:`${currentUser} id is undefined`})
        return 
    }
    try {
        const isFollowing = await connectionService.checkFollowStatus(currentUser, checkUser)
        res.status(STATUS_CODES.OK).json({isFollowing})
    } catch (error) {
        next(error)
    }
}
export const pendingRequests=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId=req.user?.userId 
        if(!userId)
        {
            res.status(STATUS_CODES.UNAUTHORIZED).json({message:"Unauthorized"})
        }
        const requests=await connectionService.getPendingRequest(userId)
        res.status(STATUS_CODES.OK).json(requests)
    } catch (error) {
        next(error)
    }
}