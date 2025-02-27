import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import candidateRoutes from "./routes/userRoutes";
import { dbConnection } from "./config/db";
import path from "path";
import { employerRoutes } from "./routes/employerRoutes";
import adminRoutes from "./routes/adminRoutes";
import { commonRoutes } from "./routes/commonRoutes";
import { interactionRoutes } from "./routes/interactionRoutes";
import { jobRoutes } from "./routes/jobRoutes";
import http from "http";
import { Server } from "socket.io";
import { chatRoutes } from "./routes/chatRoutes";
import { errorHandler } from "./middleware/errorMiddleware";
import morganMiddleware from "./utils/morgan";
import { SocketHandler } from "./utils/socketConfig";
import { TYPES } from "./types/types";
import { container } from "./utils/inversifyContainer";
import fs from 'fs';


const app = express();
dbConnection();


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 
const allowedOrigins = [
  'http://localhost:5173', 
  'https://nextstepbyhari.online', 
  'https://www.nextstepbyhari.online'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS',"PATCH"],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

app.use("/uploads", express.static(path.join(__dirname, "dist/utils/uploads")));
app.use(candidateRoutes);

app.use(adminRoutes);
app.use(commonRoutes);
app.use(employerRoutes);
app.use(interactionRoutes);
app.use(jobRoutes);
app.use(chatRoutes);

app.use(errorHandler);

app.use(morganMiddleware);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Add this debugging code to your server
console.log('Current directory:', __dirname);

// Try to list the contents of potential upload directories
const potentialPaths = [
  path.join(__dirname, "utils/uploads"),
  path.join(__dirname, "dist/utils/uploads"),
  path.join(__dirname, "../utils/uploads"),
  "/opt/render/project/src/dist/utils/uploads",
  "/opt/render/project/src/utils/uploads"
];

potentialPaths.forEach(p => {
  console.log(`Checking path: ${p}`);
  console.log(`Path exists: ${fs.existsSync(p)}`);
  if (fs.existsSync(p)) {
    try {
      console.log(`Contents: ${fs.readdirSync(p)}`);
    } catch (err) {
      console.log(`Error reading directory`,err);
    }
  }
});

const socketHandler = container.get<SocketHandler>(TYPES.SocketHandler);
socketHandler.configure(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
