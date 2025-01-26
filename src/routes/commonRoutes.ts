import express from "express";
import { checkFollowStatus, getConnections, getMutualConnections, respontToRequest, followUser, pendingRequests, followBack } from "../controllers/connectionController";
import { verifyToken } from "../middleware/authenticateToken";
import { getNotification } from "../controllers/notificationController";
export const commonRoutes=express.Router()
commonRoutes.post('/followaccount', verifyToken, followUser)
commonRoutes.post('/followback', verifyToken, followBack)
commonRoutes.post('/respond-requests',verifyToken,respontToRequest)
commonRoutes.get('/connections',verifyToken,getConnections)
commonRoutes.get('/pendingrequests',verifyToken,pendingRequests)
commonRoutes.get('/followstatus',verifyToken,checkFollowStatus)
commonRoutes.get('/notifications',verifyToken,getNotification)
commonRoutes.post('/mark-as-read',verifyToken,getNotification)
commonRoutes.get('/mutualconnections',verifyToken,getMutualConnections)