import { verifyToken } from "../middleware/authenticateToken";
import express from "express";
import { adminLogout, getUsers, individualDetails, toggleuser, verificationStatus } from "../controllers/adminController";
const adminRoutes=express.Router()
adminRoutes.get('/userdetails/:role',verifyToken,getUsers)
adminRoutes.post('/togglestatus/:id',verifyToken, toggleuser)
adminRoutes.get('/individualdetails/:id',individualDetails)
adminRoutes.patch("/verifyemployer/:id", verificationStatus)
adminRoutes.post('/adminlogout',verifyToken,adminLogout)
export default adminRoutes