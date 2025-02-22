"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoutes = void 0;
const express_1 = __importDefault(require("express"));
const inversifyContainer_1 = require("../utils/inversifyContainer");
const types_1 = require("../types/types");
exports.chatRoutes = express_1.default.Router();
const chatController = inversifyContainer_1.container.get(types_1.TYPES.ChatController);
const authMiddleware = inversifyContainer_1.container.get(types_1.TYPES.AuthMiddleware);
exports.chatRoutes.get('/messages', authMiddleware.verifyToken.bind(authMiddleware), chatController.getMessages.bind(chatController));
exports.chatRoutes.get('/get-chat/:id', authMiddleware.verifyToken.bind(authMiddleware), chatController.getChat.bind(chatController));
exports.chatRoutes.post('/fetchurl', authMiddleware.verifyToken.bind(authMiddleware), chatController.getURL.bind(chatController));
