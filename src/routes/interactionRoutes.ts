import express from "express";
import { commentPost, getComments, getPostInteractions, likePost } from "../controllers/interactionController";
import { verifyToken } from "../middleware/authenticateToken";
export const interactionRoutes = express.Router()
interactionRoutes.get('/getComments',verifyToken, getComments)
interactionRoutes.post('/likepost',verifyToken,likePost)
interactionRoutes.get('/getPostInteractions', verifyToken, getPostInteractions)
interactionRoutes.post('/commentpost', verifyToken, commentPost)