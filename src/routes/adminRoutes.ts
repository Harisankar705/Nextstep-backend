import { AuthMiddleware } from './../middleware/authenticateToken';
import { AdminController } from './../controllers/adminController';
import express from "express";
import { TYPES } from "../types/types";
import { container } from '../utils/inversifyContainer';

const adminRoutes = express.Router();

const adminController = container.get<AdminController>(TYPES.AdminController);
const authMiddleware=container.get<AuthMiddleware>(TYPES.AuthMiddleware)

adminRoutes.get('/userdetails/:role', authMiddleware.verifyToken.bind(authMiddleware), adminController.getUsers.bind(adminController));
adminRoutes.patch('/togglestatus/:id', authMiddleware.verifyToken.bind(authMiddleware), adminController.toggleUser.bind(adminController));
adminRoutes.get('/individualdetails/:id',authMiddleware.verifyToken.bind(authMiddleware), adminController.individualDetails.bind(adminController));
adminRoutes.patch("/verifyemployer/:id",authMiddleware.verifyToken.bind(authMiddleware), adminController.verificationStatus.bind(adminController));
adminRoutes.post('/adminlogout', authMiddleware.verifyToken.bind(authMiddleware), adminController.adminLogout.bind(adminController));

export default adminRoutes;
