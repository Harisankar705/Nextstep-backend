import { ConnectionController } from './../controllers/connectionController';
import express from "express";
import { container } from '../utils/inversifyContainer';
import { TYPES } from '../types/types';
import { NotificationController } from '../controllers/notificationController';
import { AuthMiddleware } from '../middleware/authenticateToken';

export const commonRoutes = express.Router();
const connectionController = container.get<ConnectionController>(TYPES.ConnectionController);
const notificationController = container.get<NotificationController>(TYPES.NotificationController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);



commonRoutes.post('/followaccount', authMiddleware.verifyToken.bind(authMiddleware), connectionController.followUser.bind(connectionController));
commonRoutes.post('/followback', authMiddleware.verifyToken.bind(authMiddleware), connectionController.followBack.bind(connectionController));
commonRoutes.post('/respond-requests', authMiddleware.verifyToken.bind(authMiddleware), connectionController.respondToRequest.bind(connectionController));
commonRoutes.get('/connections', authMiddleware.verifyToken.bind(authMiddleware), connectionController.getConnections.bind(connectionController));
commonRoutes.get('/pendingrequests',authMiddleware.verifyToken.bind(authMiddleware), connectionController.pendingRequests.bind(connectionController));
commonRoutes.get('/followstatus',authMiddleware.verifyToken.bind(authMiddleware), connectionController.checkFollowStatus.bind(connectionController));
commonRoutes.get('/notifications', authMiddleware.verifyToken.bind(authMiddleware), notificationController.getNotification.bind(notificationController));
commonRoutes.post('/mark-as-read', authMiddleware.verifyToken.bind(authMiddleware), notificationController.markNotificationAsRead.bind(notificationController));
commonRoutes.get('/mutualconnections',authMiddleware.verifyToken.bind(authMiddleware), connectionController.getMutualConnections.bind(connectionController));

export default commonRoutes;
