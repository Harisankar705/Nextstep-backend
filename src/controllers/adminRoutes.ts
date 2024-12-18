import express from "express";
import { getUsers, individualDetails, toggleuser, verificationStatus } from "../controllers/adminController";
const adminRoutes=express.Router()
adminRoutes.get('/userdetails/:role',getUsers)
adminRoutes.post('/togglestatus/:id', toggleuser)
adminRoutes.get('/individualdetails/:id',individualDetails)
adminRoutes.patch("/verifyemployer/:id", verificationStatus)
export default adminRoutes