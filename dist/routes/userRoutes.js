"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const inversifyContainer_1 = require("../utils/inversifyContainer");
const types_1 = require("../types/types");
const candidateRoutes = express_1.default.Router();
const authController = inversifyContainer_1.container.get(types_1.TYPES.AuthController);
const authMiddleware = inversifyContainer_1.container.get(types_1.TYPES.AuthMiddleware);
candidateRoutes.post('/signup', authController.signup.bind(authController));
candidateRoutes.post('/login', authController.login.bind(authController));
// candidateRoutes.post('/googleauth', googleAuthController)
candidateRoutes.post('/send-otp', authController.sendOTPcontroller.bind(authController));
candidateRoutes.post('/verify-otp', authController.verifyOTPController.bind(authController));
candidateRoutes.post('/resend-otp', authController.resendOTPcontroller.bind(authController));
candidateRoutes.post('/check-email-phone', authController.emailOrPhoneNumber.bind(authController));
candidateRoutes.post('/refreshtoken', authController.refreshTokenController.bind(authController));
candidateRoutes.post('/createpost', authMiddleware.verifyToken.bind(authMiddleware), authController.createPost.bind(authController));
candidateRoutes.post('/updatepost/:postId', authMiddleware.verifyToken.bind(authMiddleware), authController.editPost.bind(authController));
candidateRoutes.get('/userposts', authMiddleware.verifyToken.bind(authMiddleware), authController.getUserPost.bind(authController));
candidateRoutes.post('/search', authMiddleware.verifyToken.bind(authMiddleware), authController.search.bind(authController));
exports.default = candidateRoutes;
