import { ChatController } from './../controllers/chatController';
import express from 'express'
import { container } from '../utils/inversifyContainer';
import { TYPES } from '../types/types';
import { AuthMiddleware } from '../middleware/authenticateToken';
export const chatRoutes=express.Router()
const chatController = container.get<ChatController>(TYPES.ChatController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
chatRoutes.use(authMiddleware.verifyToken.bind(authMiddleware))
chatRoutes.route('/messages').get( chatController.getMessages.bind(chatController));
chatRoutes.route('/get-chat/:id').get(chatController.getChat.bind(chatController));
chatRoutes.route('/fetchurl').post( chatController.getURL.bind(chatController));
