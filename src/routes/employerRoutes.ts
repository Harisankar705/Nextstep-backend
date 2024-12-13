import express from 'express'
import { verifyToken } from '../middleware/authenticateToken'
import { employerDetails } from '../controllers/employerController'
export const employerRoutes=express.Router()
employerRoutes.post('/employerdetails',verifyToken,employerDetails)