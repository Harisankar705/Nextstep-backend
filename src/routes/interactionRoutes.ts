import express from "express";
import { checkSavedStatus, commentPost, getComments, getPostInteractions, getSavedPost, likePost, savePost } from "../controllers/interactionController";
import { verifyToken } from "../middleware/authenticateToken";
export const interactionRoutes = express.Router()
interactionRoutes.get('/getComments',verifyToken, getComments)
interactionRoutes.post('/likepost',verifyToken,likePost)
interactionRoutes.get('/getPostInteractions', verifyToken, getPostInteractions)
interactionRoutes.get('/getsavedposts',verifyToken,getSavedPost)
interactionRoutes.get('/saved-posts/check/:postId',verifyToken,checkSavedStatus)
interactionRoutes.post('/savepost',verifyToken,savePost)
interactionRoutes.post('/commentpost', verifyToken, commentPost)