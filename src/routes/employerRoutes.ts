import express from 'express';
import { AuthMiddleware } from '../middleware/authenticateToken';
import { TYPES } from '../types/types';
import { container } from '../utils/inversifyContainer';
import { EmployerController } from './../controllers/employerController';

export const employerRoutes = express.Router();

const employerController = container.get<EmployerController>(TYPES.EmployerController);
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

employerRoutes.post('/employerdetails', authMiddleware.verifyToken.bind(authMiddleware), employerController.employerDetails.bind(employerController));
employerRoutes.get('/isVerified',  authMiddleware.verifyToken.bind(authMiddleware), employerController.isEmployerVerified.bind(employerController));

export default employerRoutes;
