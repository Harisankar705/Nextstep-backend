"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const types_1 = require("../types/types");
const inversifyContainer_1 = require("../utils/inversifyContainer");
const adminRoutes = express_1.default.Router();
const adminController = inversifyContainer_1.container.get(types_1.TYPES.AdminController);
const authMiddleware = inversifyContainer_1.container.get(types_1.TYPES.AuthMiddleware);
adminRoutes.get('/userdetails/:role', authMiddleware.verifyToken.bind(authMiddleware), adminController.getUsers.bind(adminController));
adminRoutes.patch('/togglestatus/:id', authMiddleware.verifyToken.bind(authMiddleware), adminController.toggleUser.bind(adminController));
adminRoutes.get('/individualdetails/:id', authMiddleware.verifyToken.bind(authMiddleware), adminController.individualDetails.bind(adminController));
adminRoutes.patch("/verifyemployer/:id", authMiddleware.verifyToken.bind(authMiddleware), adminController.verificationStatus.bind(adminController));
adminRoutes.post('/adminlogout', authMiddleware.verifyToken.bind(authMiddleware), adminController.adminLogout.bind(adminController));
exports.default = adminRoutes;
