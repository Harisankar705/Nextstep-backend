import { ConnectionService } from './../services/connectionService';
import { NextFunction, Response, Request } from 'express';
import { ConnectionStatus } from '../types/authTypes';
import { STATUS_CODES } from '../utils/statusCode';
import { TYPES } from '../types/types';
import { inject } from 'inversify';
import { IConnectionController } from '../types/controllerinterface';
import { FollowBackDTO, FollowUserDTO, RespondToRequestDTO } from '../dtos/userDTO';
import { validateDTO } from '../dtos/validateDTO';
export class ConnectionController implements IConnectionController {
    constructor(@inject(TYPES.ConnectionService)private connectionService:ConnectionService) {}
    public followUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log("IN UNFOLLOW")
            const followUserDTO=await validateDTO(FollowUserDTO,req.body)
            const followerId = req.user?.userId;
            if (!followerId ) {
                 res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Authentication required!" });
                 return
            }
            const connection = await this.connectionService.followUser(followerId, followUserDTO.followingId);
            res.status(STATUS_CODES.OK).json({ success: true, data: connection });
            return; 
        } catch (error) {
            next(error); 
            return; 
        }
    };
    public unfollow = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const followUserDTO=await validateDTO(FollowUserDTO,req.body)
            const followerId = req.user?.userId;
            if (!followerId ) {
                 res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Authentication required!" });
                 return
            }
            const connection = await this.connectionService.followUser(followerId, followUserDTO.followingId);
            res.status(STATUS_CODES.OK).json({ success: true, message:"Successfully unfollowed!" });
            return; 
        } catch (error) {
            next(error); 
            return; 
        }
    };
    public followBack = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const followBackDTO=await validateDTO(FollowBackDTO,req.body)
            const userId = req.user?.userId;
            
            const connection = await this.connectionService.respondToRequest(userId, followBackDTO.connectionId, ConnectionStatus.FOLLOWBACK);
            if (!connection) {
                 res.status(STATUS_CODES.NOT_FOUND).json({ message: "Connection request not found" });
                 return
            }
            res.status(STATUS_CODES.OK).json({ success: true, data: connection });
            return;
        } catch (error) {
            next(error);
            return;
        }
    };
    public respondToRequest = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const respondToRequestDTO=await validateDTO(RespondToRequestDTO,req.body)
            const userId = req.user?.userId;
            
            
            const connection = await this.connectionService.respondToRequest(respondToRequestDTO.connectionId, userId, respondToRequestDTO.status);
            res.status(STATUS_CODES.OK).json({ success: true, data: connection });
            return;
        } catch (error) {
            next(error);
            return;
        }
    };
    public getConnections = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
           
            const connections = await this.connectionService.getConnections(userId);
            console.log("CONNECTIONS",connections)
            res.status(STATUS_CODES.OK).json({ data: connections });
            return;
        } catch (error) {
            next(error);
            return;
        }
    };
    public getMutualConnections = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { targetUserId } = req.params;
            const userId = req.user?.userId;
            if (!targetUserId || !userId) {
                 res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Data not found in params" });
                 return
            }
            const mutualConnections = await this.connectionService.getMutualConnections(userId, targetUserId);
            res.status(STATUS_CODES.OK).json({ data: mutualConnections });
            return;
        } catch (error) {
            next(error);
            return;
        }
    };
    public checkFollowStatus = async (req: Request, res: Response, next: NextFunction) => {
        const currentUser = req.user?.userId;
        const checkUser = req.query.followingId as string;
        if (!currentUser || !checkUser) {
             res.status(STATUS_CODES.UNAUTHORIZED).json({ message: `${currentUser} id is undefined` });
             return
        }
        try {
            const isFollowing = await this.connectionService.checkFollowStatus(currentUser, checkUser);
            console.log("IS FOLLOWING",isFollowing)
            res.status(STATUS_CODES.OK).json({ isFollowing });
            return;
        } catch (error) {
            next(error);
            return;
        }
    };
    public removeRequest = async (req: Request, res: Response, next: NextFunction) => {
        const {requestId}=req.params
        if (!requestId ) {
             res.status(STATUS_CODES.UNAUTHORIZED).json({ message: `${requestId} id is undefined` });
             return
        }
        try {
            const deleteRequest = await this.connectionService.deleteRequest(requestId);
            if(!deleteRequest)
            {
                res.status(STATUS_CODES.NOT_FOUND).json({success:false,message:"Request not found"})
                return
            }
            res.status(STATUS_CODES.OK).json({success:true,message:"Request deleted successfully!"})
            return
        } catch (error) {
            next(error);
            return;
        }
    };
    public pendingRequests = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user?.userId;
          
            const requests = await this.connectionService.getPendingRequest(userId);
            res.status(STATUS_CODES.OK).json(requests);
            return;
        } catch (error) {
            next(error);
            return;
        }
    };
}
