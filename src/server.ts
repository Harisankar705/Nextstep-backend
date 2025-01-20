import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import candidateRoutes from "./routes/userRoutes";
import { dbConnection } from './config/db';
import path from 'path';
import { employerRoutes } from "./routes/employerRoutes";
import adminRoutes from "./routes/adminRoutes";
import { commonRoutes } from "./routes/commonRoutes";
import { interactionRoutes } from "./routes/interactionRoutes";
import { jobRoutes } from "./routes/jobRoutes";
import http from 'http'
import { Server } from "socket.io";
import { chatRoutes } from "./routes/chatRoutes";
import { socketConfig } from "./utils/socketConfig";
const app = express();

dbConnection();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true, 
}));

app.use('/uploads', express.static(path.join(__dirname, 'utils/uploads')));
app.use(adminRoutes)
app.use(commonRoutes)
app.use(employerRoutes)
app.use(candidateRoutes);
app.use(interactionRoutes)
app.use(jobRoutes)
app.use(chatRoutes)
const server=http.createServer(app)
const io=new Server(server,{
    cors:{
          origin: 'http://localhost:5173',
          credentials:true,
          methods:['GET',"POST"]


    },
})
socketConfig(io)


server.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});