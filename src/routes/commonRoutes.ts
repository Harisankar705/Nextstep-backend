import express from "express";
import { checkFollowStatus, getConnections, getMutualConnections, respontToRequest, followUser, pendingRequests, followBack } from "../controllers/connectionController";
import { verifyToken } from "../middleware/authenticateToken";
export const commonRoutes=express.Router()
commonRoutes.post('/followaccount', verifyToken, followUser)
commonRoutes.post('/followback', verifyToken, followBack)
commonRoutes.post('/respond-requests',verifyToken,respontToRequest)
commonRoutes.get('/connections',verifyToken,getConnections)
commonRoutes.get('/pendingrequests',verifyToken,pendingRequests)
commonRoutes.get('/followstatus',verifyToken,checkFollowStatus)
commonRoutes.get('/mutualconnections',verifyToken,getMutualConnections)