import { sendRequest } from './../controllers/connectionController';
import { ConnectionRepository } from "../repositories/connectionRepository";
import { ConnectionStatus, IConnection } from '../types/authTypes';
import ConnectionModel from '../models/connection';
import notificationModel from '../models/notification';

export class ConnectionService
{
    private connectionRepository:ConnectionRepository
    constructor()
    {
        this.connectionRepository=new ConnectionRepository()
    }
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

        await ConnectionModel.create({
            followerId: followerId,
            followingId: followingId,
            isFollowBack: false,
            status: ConnectionStatus.NOTFOLLOWINGBACK
        });
        const notificaton=new notificationModel({
            userId:followingId,
            message:`${followerId} has followed you!`
        })
        await notificaton.save( )
        
        return true

        
        

     }
     async getConnections(userId:string):Promise<IConnection[]>{
        return await this.connectionRepository.getUserConnection(userId)
     }
    async respondToRequest(userId: string, connectionId: string, status: ConnectionStatus = ConnectionStatus.FOLLOWBACK): Promise<IConnection |null>
     {
        return await this.connectionRepository.updateConnectionStatus(userId, connectionId, status)
     }
    async getMutualConnections(userId1: string, userId2: string): Promise<IConnection[]>{
         await this.connectionRepository.getMutualConnection
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
        await this.connectionRepository.removeConnection(exisitingConnection._id)
     }
    async getPendingRequest(userId: string): Promise<IConnection[]>{
        return await this.connectionRepository.getPendingRequests(userId)
     }

}