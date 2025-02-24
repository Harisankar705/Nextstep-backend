"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interactionRoutes = void 0;
const express_1 = __importDefault(require("express"));
exports.interactionRoutes = express_1.default.Router();
const inversifyContainer_1 = require("../utils/inversifyContainer");
const types_1 = require("../types/types");
const interactionController = inversifyContainer_1.container.get(types_1.TYPES.InteractionController);
const authMiddleware = inversifyContainer_1.container.get(types_1.TYPES.AuthMiddleware);
exports.interactionRoutes.get('/getComments', authMiddleware.verifyToken.bind(authMiddleware), interactionController.getComments.bind(interactionController));
exports.interactionRoutes.post('/likepost', authMiddleware.verifyToken.bind(authMiddleware), interactionController.likePost.bind(interactionController));
exports.interactionRoutes.get('/getPostInteractions', authMiddleware.verifyToken.bind(authMiddleware), interactionController.getPostInteractions.bind(interactionController));
exports.interactionRoutes.get('/getsavedposts', authMiddleware.verifyToken.bind(authMiddleware), interactionController.getSavedPost.bind(interactionController));
exports.interactionRoutes.get('/saved-posts/check/:postId', authMiddleware.verifyToken.bind(authMiddleware), interactionController.checkSavedStatus.bind(interactionController));
exports.interactionRoutes.post('/savepost', authMiddleware.verifyToken.bind(authMiddleware), interactionController.savePost.bind(interactionController));
exports.interactionRoutes.delete('/deletepost', authMiddleware.verifyToken.bind(authMiddleware), interactionController.deletePost.bind(interactionController));
exports.interactionRoutes.get('/getpost', authMiddleware.verifyToken.bind(authMiddleware), interactionController.getPost.bind(interactionController));
exports.interactionRoutes.post('/commentpost', authMiddleware.verifyToken.bind(authMiddleware), interactionController.commentPost.bind(interactionController));
