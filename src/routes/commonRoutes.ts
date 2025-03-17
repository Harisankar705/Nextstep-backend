import { ConnectionController } from './../controllers/connectionController';
import express from "express";
import { container } from '../utils/inversifyContainer';
import { TYPES } from '../types/types';
import { NotificationController } from '../controllers/notificationController';
import { AuthMiddleware } from '../middleware/authenticateToken';
import { ReportController } from '../controllers/reportController';
import { AuthController } from '../controllers/authController';
import { auth } from 'google-auth-library';
export const commonRoutes = express.Router();
const connectionController = container.get<ConnectionController>(TYPES.ConnectionController);
const notificationController = container.get<NotificationController>(TYPES.NotificationController);
const reportController = container.get<ReportController>(TYPES.ReportController);
const authController=container.get<AuthController>(TYPES.AuthController)
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
commonRoutes.route('/forgot-password').post(authController.requestPasswordReset.bind(authController))
commonRoutes.route('/reset-password').post(authController.resetPassword.bind(authController))
commonRoutes.use(authMiddleware.verifyToken.bind(authMiddleware))
commonRoutes.route('/followaccount').post( connectionController.followUser.bind(connectionController));
commonRoutes.route('/unfollowaccount').post( connectionController.unfollow.bind(connectionController));
commonRoutes.route('/followback').post(connectionController.followBack.bind(connectionController));
commonRoutes.route('/respond-requests').post( connectionController.respondToRequest.bind(connectionController));
commonRoutes.route('/connections').get(connectionController.getConnections.bind(connectionController));
commonRoutes.route('/pendingrequests').get(connectionController.pendingRequests.bind(connectionController));
commonRoutes.route('/followstatus').get( connectionController.checkFollowStatus.bind(connectionController));
commonRoutes.route('/rejectrequest/:requestId').delete( connectionController.removeRequest.bind(connectionController));
commonRoutes.route('/notifications').get( notificationController.getNotification.bind(notificationController));
commonRoutes.route('/mark-as-read').post( notificationController.markNotificationAsRead.bind(notificationController));
commonRoutes.route('/mutualconnections').get( connectionController.getMutualConnections.bind(connectionController));
commonRoutes.route('/create-report').post(reportController.createReport.bind(reportController));
commonRoutes.route('/getreports').get(reportController.getReports.bind(reportController));
commonRoutes.route('/change-report-status').post(reportController.changeReportStatus.bind(reportController));
export default commonRoutes;
