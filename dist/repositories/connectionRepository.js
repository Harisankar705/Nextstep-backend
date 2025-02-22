"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionRepository = void 0;
const authTypes_1 = require("./../types/authTypes");
const baseRepository_1 = require("./baseRepository");
class ConnectionRepository extends baseRepository_1.BaseRepository {
    constructor(model) {
        super(model);
    }
    async findExisitingConnection(followerId, followingId) {
        return await this.findOne({
            $or: [
                { followerId, followingId },
                { followerId: followingId, followingId: followerId },
            ]
        });
    }
    async getUserConnection(userId) {
        try {
            return await this.model.find({
                $or: [
                    { followerId: userId },
                    { followingId: userId },
                ],
                status: authTypes_1.ConnectionStatus.FOLLOWBACK
            }).populate('followerId followingId', 'firstName lastName email profilePicture').exec();
        }
        catch (error) {
            throw new Error('Could not fetch user connections');
        }
    }
    async getPendingRequests(userId) {
        return await this.model.find({
            followingId: userId,
            status: authTypes_1.ConnectionStatus.NOTFOLLOWINGBACK
        }).populate('followerId followingId', 'firstName lastName email profilePicture').exec();
    }
    async getSendRequests(userId) {
        return await this.model.find({
            followerId: userId,
        }).populate('followerId followingId', 'firstName lastName email profilePicture').exec();
    }
    async find(query) {
        return await this.model.find(query).exec();
    }
    async findWithPopulate(query) {
        return await this.model.find(query)
            .populate('followerId followingId', 'firstName lastName email profilePicture')
            .exec();
    }
    async updateConnectionStatus(userId, connectionId, status) {
        const connection = await this.findOne({
            _id: connectionId,
            followingId: userId,
            status: authTypes_1.ConnectionStatus.NOTFOLLOWINGBACK
        });
        if (!connection)
            return null;
        connection.status = status;
        if (status === authTypes_1.ConnectionStatus.FOLLOWBACK) {
            const reverseConnection = await this.findOne({
                followerId: connection.followerId,
                followingId: connection.followingId,
                status: authTypes_1.ConnectionStatus.FOLLOWBACK
            });
            connection.isFollowBack = !!reverseConnection;
        }
        return await connection.save();
    }
    async getMutualConnection(userId1, userId2) {
        try {
            return await this.model.find({
                $or: [
                    { followerId: userId1, followingId: userId2 },
                    { followerId: userId2, followingId: userId1 }
                ],
                status: authTypes_1.ConnectionStatus.FOLLOWBACK
            }).populate('followerId followingId', 'firstName lastName email profilePicture').exec();
        }
        catch (error) {
            throw new Error('Could not fetch mutual connections');
        }
    }
}
exports.ConnectionRepository = ConnectionRepository;
