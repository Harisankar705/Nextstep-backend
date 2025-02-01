import { chatController } from './../controllers/chatController';
import express from 'express'
import { verifyToken } from "../middleware/authenticateToken";

export const chatRoutes=express.Router()
chatRoutes.get('/messages',verifyToken,chatController.getMessages)
chatRoutes.get('/get-chat/:id',verifyToken,chatController.getChat)
chatRoutes.post('/fetchurl',verifyToken,chatController.getURL)
// chatRoutes.post('/send-message',verifyToken,sendMessage)
