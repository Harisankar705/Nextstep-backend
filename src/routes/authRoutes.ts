import express from "express";
import { googleAuthController, login, signup } from "../controllers/authController";
import { googleAuth } from "../utils/googleAuth";
const userRoutes=express.Router()
userRoutes.post('/signup',signup)
userRoutes.post('/login',login)
userRoutes.post('/googleauth',googleAuthController)