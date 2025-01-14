import express from 'express'
import { getMessages } from '../controllers/chatController'
import { verifyToken } from "../middleware/authenticateToken";

export const chatRoutes=express.Router()
chatRoutes.get('/messages',verifyToken,getMessages)