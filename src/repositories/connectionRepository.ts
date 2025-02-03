import { ConnectionStatus } from './../types/authTypes';
import { IConnection } from "../types/authTypes";
import { IConnectionRepository } from '../types/repositoryInterface';
import ConnectionModel from '../models/connection';
import { BaseRepository } from "./baseRepository"; 
import { Model } from 'mongoose';
export class ConnectionRepository extends BaseRepository<IConnection> implements IConnectionRepository {
    constructor(  model:Model<IConnection>) {
        super(model); 
    }
    async findExisitingConnection(followerId: string, followingId: string): Promise<IConnection | null> {
        return await this.findOne({
            $or: [
                { followerId, followingId },
                { followerId: followingId, followingId: followerId },
            ]
        });
    }
    async getUserConnection(userId: string): Promise<IConnection[]> {
        try {
            return await this.model.find({
                $or: [
                    { followerId: userId },
                    { followingId: userId },
                ],
                status: ConnectionStatus.FOLLOWBACK
            }).populate('followerId followingId', 'firstName lastName email profilePicture').exec();
        } catch (error) {
            throw new Error('Could not fetch user connections');
        }
    }
    async getPendingRequests(userId: string): Promise<IConnection[]> {
        return await this.model.find({
            followingId: userId,
            status: ConnectionStatus.NOTFOLLOWINGBACK
        }).populate('followerId followingId', 'firstName lastName email profilePicture').exec();
    }
    async getSendRequests(userId: string): Promise<IConnection[]> {
        return await this.model.find({
            followerId: userId,
        }).populate('followerId followingId', 'firstName lastName email profilePicture').exec();
    }
    async find(query: any): Promise<IConnection[]> {
        return await this.find(query);
    }
    async findWithPopulate(query: any): Promise<IConnection[]> {
        return await this.model.find(query)
            .populate('followerId followingId', 'firstName lastName email profilePicture')
            .exec();
    }
    async updateConnectionStatus(userId: string, connectionId: string, status: ConnectionStatus): Promise<IConnection | null> {
        const connection = await this.findOne({
            _id: connectionId,
            followingId: userId,
            status: ConnectionStatus.NOTFOLLOWINGBACK
        });
        if (!connection) return null;
        connection.status = status;
        if (status === ConnectionStatus.FOLLOWBACK) {
            const reverseConnection = await this.findOne({
                followerId: connection.followerId,
                followingId: connection.followingId,
                status: ConnectionStatus.FOLLOWBACK
            });
            connection.isFollowBack = !!reverseConnection;
        }
        return await connection.save();
    }
    async getMutualConnection(userId1: string, userId2: string): Promise<IConnection[]> {
        try {
            return await this.model.find({
                $or: [
                    { followerId: userId1, followingId: userId2 },
                    { followerId: userId2, followingId: userId1 }
                ],
                status: ConnectionStatus.FOLLOWBACK
            }).populate('followerId followingId', 'firstName lastName email profilePicture').exec();
        } catch (error) {
            throw new Error('Could not fetch mutual connections');
        }
    }
}
