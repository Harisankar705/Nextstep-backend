import express from "express";
import cors from 'cors';
import cookieParser from 'cookie-parser';
import candidateRoutes from "./routes/userRoutes";
import { dbConnection } from './config/db';
import path from 'path';
import { employerRoutes } from "./routes/employerRoutes";
import adminRoutes from "./routes/adminRoutes";

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
app.use(employerRoutes)
app.use(candidateRoutes);

app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});