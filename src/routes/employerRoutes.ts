import express from 'express';
import { AuthMiddleware } from '../middleware/authenticateToken';
import { TYPES } from '../types/types';
import { container } from '../utils/inversifyContainer';
import { EmployerController } from './../controllers/employerController';
export const employerRoutes = express.Router();
const employerController = container.get<EmployerController>(TYPES.EmployerController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);
employerRoutes.use(authMiddleware.verifyToken.bind(authMiddleware))
employerRoutes.route('/employerdetails').post( employerController.employerDetails.bind(employerController));
employerRoutes.route('/isVerified').get(employerController.isEmployerVerified.bind(employerController));
export default employerRoutes;
