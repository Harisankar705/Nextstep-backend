import express from "express";
import { authController } from './../controllers/authController';
import { verifyToken } from "../middleware/authenticateToken";
const candidateRoutes = express.Router()
candidateRoutes.post('/signup', authController.signup)
candidateRoutes.post('/login',  authController.login)
// candidateRoutes.post('/googleauth', googleAuthController)
candidateRoutes.post('/send-otp',  authController.sendOTPcontroller)
candidateRoutes.post('/verify-otp',  authController.verifyOTPController)
candidateRoutes.post('/resend-otp',  authController.resendOTPcontroller)
candidateRoutes.post('/check-email-phone', authController. emailOrPhoneNumber)
candidateRoutes.post('/refreshtoken',  authController.refreshTokenController)
candidateRoutes.post('/createpost',verifyToken, authController. createPost) 
candidateRoutes.get('/userposts',verifyToken, authController.getUserPost)
candidateRoutes.post('/search',verifyToken, authController.search)
export default candidateRoutes  