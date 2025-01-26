import express from 'express'
import { getChat, getMessages, getURL,  } from '../controllers/chatController'
import { verifyToken } from "../middleware/authenticateToken";

export const chatRoutes=express.Router()
chatRoutes.get('/messages',verifyToken,getMessages)
chatRoutes.get('/get-chat/:id',verifyToken,getChat)
chatRoutes.post('/fetchurl',verifyToken,getURL)
// chatRoutes.post('/send-message',verifyToken,sendMessage)
