import express from "express";
import { emailOrPhoneNumber, googleAuthController, login, refreshTokenController, resendOTPcontroller, sendOTPcontroller, signup, verifyOTPController } from "../controllers/authController";
import { googleAuth } from "../utils/googleAuth";
const authRoutes=express.Router()
authRoutes.post('/signup',signup)
authRoutes.post('/login',login)
authRoutes.post('/googleauth',googleAuthController)
authRoutes.post('/send-otp',sendOTPcontroller)
authRoutes.post('/verify-otp',verifyOTPController)
authRoutes.post('/resend-otp',resendOTPcontroller)
authRoutes.post('/check-email-phone',emailOrPhoneNumber)
authRoutes.post('/refresh-token',refreshTokenController)
export default authRoutes