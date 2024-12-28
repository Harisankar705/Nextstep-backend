import { ConnectionStatus } from './../types/authTypes';
import { Connection, Document } from "mongoose";
import { BaseRepository } from "./baseRepository";
import { IConnection } from "../types/authTypes";
import ConnectionModel from '../models/connection';

export class ConnectionRepository extends BaseRepository<IConnection> {
    constructor() {
        super(ConnectionModel)
    }

    async findExisitingConnection(followerId: string, followingId: string): Promise<IConnection | null> {
        const connection= await this.findOne({
            $or: [
                { followerId, followingId },
                { followerId: followingId, followingId: followerId },
            ]
        });
        return connection
    }

    async getUserConnection(userId: string): Promise<IConnection[]> {
        try {
            return await ConnectionModel.find({
                $or: [
                    { followerId: userId },
                    { followingId: userId },
                ],
                status: ConnectionStatus.FOLLOWBACK
            }).populate('followerId followingId', 'firstName lastName email profilePicture').exec();
        } catch (error) {
            console.error('Error fetching user connections:', error);
            throw new Error('Could not fetch user connections');
        }
    }

    async getPendingRequests(userId: string): Promise<IConnection[]> {
        const connections = await ConnectionModel.find({
            followingId: userId,
            status: ConnectionStatus.NOTFOLLOWINGBACK
        }).populate('followerId followingId', 'firstName lastName email profilePicture');
        return connections;
    }

    async getSendRequests(userId: string): Promise<IConnection[]> {
        const connections = await ConnectionModel.find({
            followerId: userId,
        }).populate('followerId followingId', 'firstName lastName email profilePicture');
        return connections;
    }

    async find(query: any): Promise<IConnection[]> {
        return await ConnectionModel.find(query).exec();
    }

    async findWithPopulate(query: any): Promise<IConnection[]> {
        return await ConnectionModel.find(query)
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
            return await ConnectionModel.find({
                $or: [
                    { followerId: userId1, followingId: userId2 },
                    { followerId: userId2, followingId: userId1 }
                ],
                status: ConnectionStatus.FOLLOWBACK
            }).populate('followerId followingId', 'firstName lastName email profilePicture').exec();
        } catch (error) {
            console.error('Error fetching mutual connections:', error);
            throw new Error('Could not fetch mutual connections');
        }
    }
}