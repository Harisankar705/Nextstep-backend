import express from "express";
import { container } from "../utils/inversifyContainer";
import { TYPES } from "../types/types";
import { AuthController } from "../controllers/authController";
import { AuthMiddleware } from "../middleware/authenticateToken";

const candidateRoutes = express.Router();
const authController = container.get<AuthController>(TYPES.AuthController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

candidateRoutes
  .post('/signup', authController.signup.bind(authController))
  .post('/login', authController.login.bind(authController))
  .post('/google',authController.googleLogin.bind(authController))
  .post('/send-otp', authController.sendOTPcontroller.bind(authController))
  .post('/verify-otp', authController.verifyOTPController.bind(authController))
  .post('/resend-otp', authController.resendOTPcontroller.bind(authController))
  .post('/check-email-phone', authController.emailOrPhoneNumber.bind(authController))
  .post('/refreshtoken', authController.refreshTokenController.bind(authController))
  .post('/createpost', 
    authMiddleware.verifyToken.bind(authMiddleware), 
    authController.createPost.bind(authController)
  )
  .post('/updatepost/:postId', 
    authMiddleware.verifyToken.bind(authMiddleware), 
    authController.editPost.bind(authController)
  )
  .get('/userposts', 
    authMiddleware.verifyToken.bind(authMiddleware), 
    authController.getUserPost.bind(authController)
  )
  .post('/search', 
    authMiddleware.verifyToken.bind(authMiddleware), 
    authController.search.bind(authController)
  )
  .post('/candidate-details', 
    authMiddleware.verifyToken.bind(authMiddleware), 
    authController.candidateDetails.bind(authController)
  );

export default candidateRoutes;
