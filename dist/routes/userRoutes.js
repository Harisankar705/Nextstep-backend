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
candidateRoutes
    .post('/signup', authController.signup.bind(authController))
    .post('/login', authController.login.bind(authController))
    .post('/google', authController.googleLogin.bind(authController))
    .post('/send-otp', authController.sendOTPcontroller.bind(authController))
    .post('/verify-otp', authController.verifyOTPController.bind(authController))
    .post('/resend-otp', authController.resendOTPcontroller.bind(authController))
    .post('/check-email-phone', authController.emailOrPhoneNumber.bind(authController))
    .post('/refreshtoken', authController.refreshTokenController.bind(authController))
    .post('/createpost', authMiddleware.verifyToken.bind(authMiddleware), authController.createPost.bind(authController))
    .post('/updatepost/:postId', authMiddleware.verifyToken.bind(authMiddleware), authController.editPost.bind(authController))
    .get('/userposts', authMiddleware.verifyToken.bind(authMiddleware), authController.getUserPost.bind(authController))
    .post('/search', authMiddleware.verifyToken.bind(authMiddleware), authController.search.bind(authController))
    .post('/candidate-details', authMiddleware.verifyToken.bind(authMiddleware), authController.candidateDetails.bind(authController));
exports.default = candidateRoutes;
