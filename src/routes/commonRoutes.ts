import { ConnectionController } from './../controllers/connectionController';
import express from "express";
import { container } from '../utils/inversifyContainer';
import { TYPES } from '../types/types';
import { NotificationController } from '../controllers/notificationController';
import { AuthMiddleware } from '../middleware/authenticateToken';
import { ReportController } from '../controllers/reportController';

export const commonRoutes = express.Router();
const connectionController = container.get<ConnectionController>(TYPES.ConnectionController);
const notificationController = container.get<NotificationController>(TYPES.NotificationController);
const reportController = container.get<ReportController>(TYPES.ReportController);
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
commonRoutes.post('/create-report',authMiddleware.verifyToken.bind(authMiddleware), reportController.createReport.bind(reportController));
commonRoutes.get('/getreports',authMiddleware.verifyToken.bind(authMiddleware), reportController.getReports.bind(reportController));
commonRoutes.post('/change-report-status',authMiddleware.verifyToken.bind(authMiddleware), reportController.changeReportStatus.bind(reportController));


export default commonRoutes;
