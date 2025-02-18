import { ChatController } from './../controllers/chatController';
import express from 'express'
import { container } from '../utils/inversifyContainer';
import { TYPES } from '../types/types';
import { AuthMiddleware } from '../middleware/authenticateToken';

export const chatRoutes=express.Router()
const chatController = container.get<ChatController>(TYPES.ChatController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

chatRoutes.get('/messages',authMiddleware.verifyToken.bind(authMiddleware), chatController.getMessages.bind(chatController));
chatRoutes.get('/get-chat/:id', authMiddleware.verifyToken.bind(authMiddleware),chatController.getChat.bind(chatController));
chatRoutes.post('/fetchurl', authMiddleware.verifyToken.bind(authMiddleware), chatController.getURL.bind(chatController));

