import express from "express";
export const interactionRoutes = express.Router()
import { verifyToken } from "../middleware/authenticateToken";
import { interactionController } from "../controllers/interactionController";
interactionRoutes.get('/getComments',verifyToken,interactionController.getComments)
interactionRoutes.post('/likepost',verifyToken,interactionController.likePost)
interactionRoutes.get('/getPostInteractions', verifyToken, interactionController.getPostInteractions)
interactionRoutes.get('/getsavedposts',verifyToken,interactionController.getSavedPost)
interactionRoutes.get('/saved-posts/check/:postId',verifyToken,interactionController.checkSavedStatus)
interactionRoutes.post('/savepost',verifyToken,interactionController.savePost)
interactionRoutes.get('/getpost',verifyToken,interactionController.getPost)
interactionRoutes.post('/commentpost', verifyToken, interactionController.commentPost)