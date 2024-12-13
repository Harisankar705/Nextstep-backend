import express from "express";
import { getUsers, toggleuser } from "../controllers/adminController";
const adminRoutes=express.Router()
adminRoutes.get('/userdetails/:role',getUsers)
adminRoutes.post('/togglestatus/:id', toggleuser)
export default adminRoutes