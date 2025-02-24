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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.options('*', cors());

app.use("/uploads", express.static(path.join(__dirname, "utils/uploads")));

app.use(adminRoutes);
app.use(commonRoutes);
app.use(employerRoutes);
app.use(candidateRoutes);
app.use(interactionRoutes);
app.use(jobRoutes);
app.use(chatRoutes);

// Error Handler
app.use(errorHandler);

// Logger Middleware
app.use(morganMiddleware);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  }
});

const socketHandler = container.get<SocketHandler>(TYPES.SocketHandler);
socketHandler.configure(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
