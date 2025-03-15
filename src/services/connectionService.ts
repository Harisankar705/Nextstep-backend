import { ConnectionRepository } from './../repositories/connectionRepository';
import { ConnectionStatus, IConnection } from '../types/authTypes';
import ConnectionModel from '../models/connection';
import notificationModel from '../models/notification';
import { IConnectionService } from "../types/serviceInterface";
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types';
import UserModel from '../models/User';
import { SocketHandler } from '../utils/socketConfig';
@injectable()
export class ConnectionService implements IConnectionService
    {
    constructor(@inject(TYPES.ConnectionRepository)private connectionRepository:ConnectionRepository,
                @inject(TYPES.SocketHandler)private socketHandler:SocketHandler)
    {}
    async followUser(followerId: string, followingId: string): Promise<boolean>
     {  
        if(followerId ===followingId)   
        {
            throw new Error("cannot send connection request to yourself!")
        }
        const existingConnection =await this.connectionRepository.findExisitingConnection(followerId,followingId)
        if (existingConnection) {
            await ConnectionModel.findByIdAndDelete(existingConnection._id);
            return false;
        }
        const sender=await UserModel.findById(followerId)
        await ConnectionModel.create({
            followerId: followerId,
            followingId: followingId,
            isFollowBack: false,
            status: ConnectionStatus.NOTFOLLOWINGBACK
        });
        const notification=await notificationModel.create({
            sender:followerId,
            recipientId:followingId,
            content:`${sender?.firstName} send you a connection request!`,
            link:`/followrequests`,
            type:"Connection_request",
            read:false,
            createdAt:new Date()
        })
        this.socketHandler.emitNotification(followingId,{
            content:`${sender?.firstName} send you a connection request!`,
            userId:followerId,
            link:'/followrequests'
        })
       
        return true
     }
     async getConnections(userId:string):Promise<IConnection[]>{
        return await this.connectionRepository.getUserConnection(userId)
     }
    async respondToRequest(userId: string, connectionId: string, status: ConnectionStatus = ConnectionStatus.FOLLOWBACK): Promise<IConnection |null>
     {
        return await this.connectionRepository.updateConnectionStatus(userId, connectionId, status)
     }
     async getMutualConnections(userId1: string, userId2: string): Promise<IConnection[]> {
        if (!userId1 || !userId2) {
            throw new Error("Both user IDs are required!");
        }
        return await this.connectionRepository.getMutualConnection(userId1, userId2);
    }
     async checkFollowStatus(currentUser:string,checkUser:string):Promise<boolean>{
        const connection=await this.connectionRepository.findExisitingConnection(currentUser,checkUser)
        return connection!==null
     }
     async unfollow(followerId:string,followingId:string):Promise<void>
     {
        const exisitingConnection=await this.connectionRepository.findExisitingConnection(followerId,followingId)
        if(!exisitingConnection)
        {
            throw new Error("no connection exists to follow")
        }
        // await this.connectionRepository.removeConnection(exisitingConnection._id)
     }
    async getPendingRequest(userId: string): Promise<IConnection[]>{
        return await this.connectionRepository.getPendingRequests(userId)
     }
}