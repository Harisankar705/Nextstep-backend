import express from "express";
export const interactionRoutes = express.Router()

import { container } from "../utils/inversifyContainer";
import { TYPES } from "../types/types";
import { InteractionController } from "../controllers/interactionController";
import { AuthMiddleware } from "../middleware/authenticateToken";
const interactionController = container.get<InteractionController>(TYPES.InteractionController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
interactionRoutes.use(authMiddleware.verifyToken.bind(authMiddleware))

interactionRoutes.route('/getComments').get(interactionController.getComments.bind(interactionController))
interactionRoutes.route('/likepost').post(interactionController.likePost.bind(interactionController))
interactionRoutes.route('/getPostInteractions').get( interactionController.getPostInteractions.bind(interactionController))
interactionRoutes.route('/getsavedposts').get(interactionController.getSavedPost.bind(interactionController))
interactionRoutes.route('/saved-posts/check/:postId').get(interactionController.checkSavedStatus.bind(interactionController))
interactionRoutes.route('/savepost').post(interactionController.savePost.bind(interactionController))
interactionRoutes.route('/deletepost').delete(interactionController.deletePost.bind(interactionController))
interactionRoutes.route('/getpost').get(interactionController.getPost.bind(interactionController))
interactionRoutes.route('/commentpost').post(interactionController.commentPost.bind(interactionController))