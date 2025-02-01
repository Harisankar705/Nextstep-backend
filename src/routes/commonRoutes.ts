import { notificationController } from './../controllers/notificationController';
import express from "express";
import { verifyToken } from "../middleware/authenticateToken";
import { connectionController } from '../controllers/connectionController';
export const commonRoutes=express.Router()
commonRoutes.post('/followaccount', verifyToken,connectionController. followUser)
commonRoutes.post('/followback', verifyToken,connectionController. followBack)
commonRoutes.post('/respond-requests',verifyToken,connectionController.respondToRequest)
commonRoutes.get('/connections',verifyToken,connectionController.getConnections)
commonRoutes.get('/pendingrequests',verifyToken,connectionController.pendingRequests)
commonRoutes.get('/followstatus',verifyToken,connectionController.checkFollowStatus)
commonRoutes.get('/notifications',verifyToken,notificationController.getNotification)
commonRoutes.post('/mark-as-read',verifyToken,notificationController.getNotification)
commonRoutes.get('/mutualconnections',verifyToken,connectionController.getMutualConnections)