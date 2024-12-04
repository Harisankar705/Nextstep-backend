import express from "express";
const multer=require('multer')
import { candidateDetails, emailOrPhoneNumber, googleAuthController, login, refreshTokenController, resendOTPcontroller, sendOTPcontroller, signup, verifyOTPController } from "../controllers/authController";
const upload=multer({dest:'uploads/'})
import { googleAuth } from "../utils/googleAuth";
import { verifyToken } from "../middleware/authenticateToken";
const candidateRoutes=express.Router()
candidateRoutes.post('/signup',signup)
candidateRoutes.post('/login',login)
candidateRoutes.post('/googleauth',googleAuthController)
candidateRoutes.post('/send-otp',sendOTPcontroller)
candidateRoutes.post('/verify-otp',verifyOTPController)
candidateRoutes.post('/resend-otp',resendOTPcontroller)
candidateRoutes.post('/check-email-phone',emailOrPhoneNumber)
candidateRoutes.post('/refresh-token',refreshTokenController)
candidateRoutes.post('/candidate-details',verifyToken,candidateDetails)
export default candidateRoutes  