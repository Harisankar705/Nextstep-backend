import express from "express";
import cors from 'cors'
import  authRoutes  from "./routes/userRoutes";
import {dbConnection} from './config/db'
const app=express()
app.use(cors())
dbConnection()
app.use(express.json())
app.use(authRoutes)
app.listen(4000,()=>{
    console.log('server is running')
})