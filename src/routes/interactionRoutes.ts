import express from "express";
export const interactionRoutes = express.Router()

import { container } from "../utils/inversifyContainer";
import { TYPES } from "../types/types";
import { InteractionController } from "../controllers/interactionController";
import { AuthMiddleware } from "../middleware/authenticateToken";
const interactionController = container.get<InteractionController>(TYPES.InteractionController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

interactionRoutes.get('/getComments', authMiddleware.verifyToken.bind(authMiddleware),interactionController.getComments.bind(interactionController))
interactionRoutes.post('/likepost', authMiddleware.verifyToken.bind(authMiddleware),interactionController.likePost.bind(interactionController))
interactionRoutes.get('/getPostInteractions',  authMiddleware.verifyToken.bind(authMiddleware), interactionController.getPostInteractions.bind(interactionController))
interactionRoutes.get('/getsavedposts', authMiddleware.verifyToken.bind(authMiddleware),interactionController.getSavedPost.bind(interactionController))
interactionRoutes.get('/saved-posts/check/:postId', authMiddleware.verifyToken.bind(authMiddleware),interactionController.checkSavedStatus.bind(interactionController))
interactionRoutes.post('/savepost', authMiddleware.verifyToken.bind(authMiddleware),interactionController.savePost.bind(interactionController))
interactionRoutes.delete('/deletepost', authMiddleware.verifyToken.bind(authMiddleware),interactionController.deletePost.bind(interactionController))
interactionRoutes.get('/getpost', authMiddleware.verifyToken.bind(authMiddleware),interactionController.getPost.bind(interactionController))
interactionRoutes.post('/commentpost',  authMiddleware.verifyToken.bind(authMiddleware),interactionController.commentPost.bind(interactionController))