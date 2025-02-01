import express from 'express'
export const employerRoutes=express.Router()
import { employerController } from './../controllers/employerController';
import { verifyToken } from '../middleware/authenticateToken'
employerRoutes.post('/employerdetails',verifyToken,employerController.employerDetails)
employerRoutes.get('/isVerified',verifyToken,employerController.isEmployerVerified)
