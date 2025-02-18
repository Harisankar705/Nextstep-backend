import express from "express";
import { container } from "../utils/inversifyContainer";
import { TYPES } from "../types/types";
import { AuthController } from "../controllers/authController";
import { AuthMiddleware } from "../middleware/authenticateToken";
const candidateRoutes = express.Router()
const authController = container.get<AuthController>(TYPES.AuthController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

candidateRoutes.post('/signup', authController.signup.bind(authController))
candidateRoutes.post('/login',  authController.login.bind(authController))
// candidateRoutes.post('/googleauth', googleAuthController)
candidateRoutes.post('/send-otp',  authController.sendOTPcontroller.bind(authController))
candidateRoutes.post('/verify-otp',  authController.verifyOTPController.bind(authController))
candidateRoutes.post('/resend-otp',  authController.resendOTPcontroller.bind(authController))
candidateRoutes.post('/check-email-phone', authController. emailOrPhoneNumber.bind(authController))
candidateRoutes.post('/refreshtoken',  authController.refreshTokenController.bind(authController))
candidateRoutes.post('/createpost',authMiddleware.verifyToken.bind(authMiddleware),authController. createPost.bind(authController)) 
candidateRoutes.post('/updatepost/:postId',authMiddleware.verifyToken.bind(authMiddleware),authController. editPost.bind(authController)) 
candidateRoutes.get('/userposts',authMiddleware.verifyToken.bind(authMiddleware),authController.getUserPost.bind(authController))
candidateRoutes.post('/search',authMiddleware.verifyToken.bind(authMiddleware),authController.search.bind(authController))
export default candidateRoutes  