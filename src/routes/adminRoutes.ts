import { adminController } from './../controllers/adminController';
import { verifyToken } from "../middleware/authenticateToken";
import express from "express";
const adminRoutes=express.Router()
adminRoutes.get('/userdetails/:role',verifyToken,adminController.getUsers)
adminRoutes.post('/togglestatus/:id',verifyToken,adminController. toggleUser)
adminRoutes.get('/individualdetails/:id',adminController.individualDetails)
adminRoutes.patch("/verifyemployer/:id",adminController. verificationStatus)
adminRoutes.post('/adminlogout',verifyToken,adminController.adminLogout)
export default adminRoutes