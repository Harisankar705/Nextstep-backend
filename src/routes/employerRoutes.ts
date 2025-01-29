import express from 'express'
import { verifyToken } from '../middleware/authenticateToken'
import { employerDetails, isEmployerVerified } from '../controllers/employerController'
export const employerRoutes=express.Router()
employerRoutes.post('/employerdetails',verifyToken,employerDetails)
employerRoutes.get('/isVerified',verifyToken,isEmployerVerified)
employerRoutes.post('/addjob',verifyToken)