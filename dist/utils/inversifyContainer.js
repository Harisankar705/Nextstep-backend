"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.container = void 0;
const emailService_1 = require("./emailService");
const report_1 = require("./../models/report");
const jobService_1 = require("./../services/jobService");
const chatController_1 = require("./../controllers/chatController");
const authController_1 = require("./../controllers/authController");
const adminController_1 = require("./../controllers/adminController");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
const nodemailer_1 = __importDefault(require("nodemailer"));
const adminService_1 = require("../services/adminService");
const userRepository_1 = require("../repositories/userRepository");
const adminRepository_1 = require("../repositories/adminRepository");
const otpService_1 = __importDefault(require("../services/otpService"));
const chatService_1 = require("../services/chatService");
const client_s3_1 = require("@aws-sdk/client-s3");
const connectionService_1 = require("../services/connectionService");
const employerService_1 = __importDefault(require("../services/employerService"));
const interactionService_1 = require("../services/interactionService");
const notificationService_1 = require("../services/notificationService");
const chatRepository_1 = require("../repositories/chatRepository");
const connectionRepository_1 = require("../repositories/connectionRepository");
const employerRepository_1 = require("../repositories/employerRepository");
const interactionRepository_1 = require("../repositories/interactionRepository");
const socket_io_1 = require("socket.io");
const jobRepository_1 = require("../repositories/jobRepository");
const notificationRepository_1 = require("../repositories/notificationRepository");
const User_1 = __importDefault(require("../models/User"));
const Employer_1 = __importDefault(require("../models/Employer"));
const chat_1 = require("../models/chat");
const socketConfig_1 = require("./socketConfig");
const connectionController_1 = require("../controllers/connectionController");
const notificationController_1 = require("../controllers/notificationController");
const employerController_1 = require("../controllers/employerController");
const interactionController_1 = require("../controllers/interactionController");
const jobController_1 = require("../controllers/jobController");
const authService_1 = require("../services/authService");
const post_1 = require("../models/post");
const authenticateToken_1 = require("../middleware/authenticateToken");
const reportRepository_1 = require("../repositories/reportRepository");
const reportService_1 = require("../services/reportService");
const reportController_1 = require("../controllers/reportController");
const container = new inversify_1.Container();
exports.container = container;
container.bind(types_1.TYPES.Transporter).toConstantValue(nodemailer_1.default.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
}));
container.bind(types_1.TYPES.S3Client).toConstantValue(new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_kEY
    }
}));
const io = new socket_io_1.Server();
container.bind(types_1.TYPES.SocketServer).toConstantValue(io);
container.bind(types_1.TYPES.UserModel).toConstantValue(User_1.default);
container.bind(types_1.TYPES.EmployerModel).toConstantValue(Employer_1.default);
container.bind(types_1.TYPES.ChatModel).toConstantValue(chat_1.ChatModel);
container.bind(types_1.TYPES.PostModel).toConstantValue(post_1.PostModel);
container.bind(types_1.TYPES.ReportModel).toConstantValue(report_1.ReportModel);
container.bind(types_1.TYPES.ChatService).to(chatService_1.ChatService);
container.bind(types_1.TYPES.OtpService).to(otpService_1.default);
container.bind(types_1.TYPES.AuthService).to(authService_1.AuthService);
container.bind(types_1.TYPES.AdminService).to(adminService_1.AdminService);
container.bind(types_1.TYPES.UserRepository).to(userRepository_1.UserRepository);
container.bind(types_1.TYPES.AdminRepository).to(adminRepository_1.AdminRepository);
container.bind(types_1.TYPES.AdminController).to(adminController_1.AdminController);
container.bind(types_1.TYPES.AuthController).to(authController_1.AuthController);
container.bind(types_1.TYPES.ChatController).to(chatController_1.ChatController);
container.bind(types_1.TYPES.ConnectionService).to(connectionService_1.ConnectionService);
container.bind(types_1.TYPES.EmployerService).to(employerService_1.default);
container.bind(types_1.TYPES.InteractionService).to(interactionService_1.InteractionService);
container.bind(types_1.TYPES.ConnectionController).to(connectionController_1.ConnectionController);
container.bind(types_1.TYPES.JobService).to(jobService_1.JobService);
container.bind(types_1.TYPES.NotificationService).to(notificationService_1.NotificationService);
container.bind(types_1.TYPES.ChatRepository).to(chatRepository_1.ChatRepository);
container.bind(types_1.TYPES.NotificationController).to(notificationController_1.NotificationController);
container.bind(types_1.TYPES.ConnectionRepository).to(connectionRepository_1.ConnectionRepository);
container.bind(types_1.TYPES.EmployerRepository).to(employerRepository_1.EmployerRepository);
container.bind(types_1.TYPES.InteractionRepository).to(interactionRepository_1.InteractionRepository);
container.bind(types_1.TYPES.JobRepository).to(jobRepository_1.JobRepository);
container.bind(types_1.TYPES.NotificationRepository).to(notificationRepository_1.NotificationRepository);
container.bind(types_1.TYPES.SocketHandler).to(socketConfig_1.SocketHandler);
container.bind(types_1.TYPES.EmployerController).to(employerController_1.EmployerController);
container.bind(types_1.TYPES.InteractionController).to(interactionController_1.InteractionController);
container.bind(types_1.TYPES.JobController).to(jobController_1.JobController);
container.bind(types_1.TYPES.AuthMiddleware).to(authenticateToken_1.AuthMiddleware);
container.bind(types_1.TYPES.ReportRepository).to(reportRepository_1.ReportRepository);
container.bind(types_1.TYPES.ReportService).to(reportService_1.ReportService);
container.bind(types_1.TYPES.ReportController).to(reportController_1.ReportController);
container.bind(types_1.TYPES.EmailService).to(emailService_1.EmailService);
