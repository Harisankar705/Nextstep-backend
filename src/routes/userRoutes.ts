import express from "express";
import { candidateDetails, createPost, emailOrPhoneNumber, getUserPost, login, refreshTokenController, resendOTPcontroller, search, sendOTPcontroller, signup, verifyOTPController } from "../controllers/authController";
import { verifyToken } from "../middleware/authenticateToken";

const candidateRoutes = express.Router()
candidateRoutes.post('/signup', signup)
candidateRoutes.post('/login', login)
// candidateRoutes.post('/googleauth', googleAuthController)
candidateRoutes.post('/send-otp', sendOTPcontroller)
candidateRoutes.post('/verify-otp', verifyOTPController)
candidateRoutes.post('/resend-otp', resendOTPcontroller)
candidateRoutes.post('/check-email-phone', emailOrPhoneNumber)
candidateRoutes.post('/refreshtoken', refreshTokenController)
candidateRoutes.post('/createpost',verifyToken, createPost)
candidateRoutes.get('/userposts',verifyToken,getUserPost)
candidateRoutes.post('/search',verifyToken,search)

candidateRoutes.post('/candidate-details', verifyToken, candidateDetails)
export default candidateRoutes  