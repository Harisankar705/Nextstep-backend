"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const db_1 = require("./config/db");
const path_1 = __importDefault(require("path"));
const employerRoutes_1 = require("./routes/employerRoutes");
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const commonRoutes_1 = require("./routes/commonRoutes");
const interactionRoutes_1 = require("./routes/interactionRoutes");
const jobRoutes_1 = require("./routes/jobRoutes");
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const chatRoutes_1 = require("./routes/chatRoutes");
const errorMiddleware_1 = require("./middleware/errorMiddleware");
const morgan_1 = __importDefault(require("./utils/morgan"));
const types_1 = require("./types/types");
const inversifyContainer_1 = require("./utils/inversifyContainer");
const app = (0, express_1.default)();
(0, db_1.dbConnection)();
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const allowedOrigins = [
    'http://localhost:5173',
    'https://nextstepbyhari.online',
    'https://www.nextstepbyhari.online'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        else {
            return callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', "PATCH"],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.options('*', (0, cors_1.default)());
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "utils/uploads")));
app.use(userRoutes_1.default);
app.use(adminRoutes_1.default);
app.use(commonRoutes_1.commonRoutes);
app.use(employerRoutes_1.employerRoutes);
app.use(interactionRoutes_1.interactionRoutes);
app.use(jobRoutes_1.jobRoutes);
app.use(chatRoutes_1.chatRoutes);
app.use(errorMiddleware_1.errorHandler);
app.use(morgan_1.default);
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST"]
    }
});
const socketHandler = inversifyContainer_1.container.get(types_1.TYPES.SocketHandler);
socketHandler.configure(io);
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
