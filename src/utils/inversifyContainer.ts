import { ReportModel } from './../models/report';
import { JobService } from './../services/jobService';
import { ChatController } from './../controllers/chatController';
import { AuthController } from './../controllers/authController';
import { AdminController } from './../controllers/adminController';
import { Transporter } from 'nodemailer';
import { Container } from "inversify";
import {TYPES} from '../types/types'
import nodemailer from 'nodemailer'
import { AdminService } from "../services/adminService";
import { UserRepository } from "../repositories/userRepository";
import { AdminRepository } from '../repositories/adminRepository';
import otpService from '../services/otpService';
import { ChatService } from '../services/chatService';
import { S3Client } from '@aws-sdk/client-s3';
import { ConnectionService } from '../services/connectionService';
import EmployerService from '../services/employerService';
import { InteractionService } from '../services/interactionService';
import { NotificationService } from '../services/notificationService';
import { ChatRepository } from '../repositories/chatRepository';
import { ConnectionRepository } from '../repositories/connectionRepository';
import { EmployerRepository } from '../repositories/employerRepository';
import { InteractionRepository } from '../repositories/interactionRepository';
import { Server } from 'socket.io';
import { JobRepository } from '../repositories/jobRepository';
import { NotificationRepository } from '../repositories/notificationRepository';
import UserModel from '../models/User';
import { IChatMessage, IEmployer, IPosts, IReport, IUser } from '../types/authTypes';
import { Model } from 'mongoose';
import EmployerModel from '../models/Employer';
import { ChatModel } from '../models/chat';
import {  SocketHandler } from './socketConfig';
import { ConnectionController } from '../controllers/connectionController';
import { NotificationController } from '../controllers/notificationController';
import { EmployerController } from '../controllers/employerController';
import { InteractionController } from '../controllers/interactionController';
import { JobController } from '../controllers/jobController';
import { AuthService } from '../services/authService';
import { PostModel } from '../models/post';
import { AuthMiddleware } from '../middleware/authenticateToken';
import { ReportRepository } from '../repositories/reportRepository';
import { ReportService } from '../services/ReportService';
const container=new Container()
container.bind<Transporter>(TYPES.Transporter).toConstantValue(nodemailer.createTransport({
    service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
}))
container.bind<S3Client>(TYPES.S3Client).toConstantValue(new S3Client({
    region:process.env.AWS_REGION!,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey:process.env.AWS_SECRET_kEY!
    }
}))
const io=new Server()   
container.bind<Server>(TYPES.SocketServer).toConstantValue(io)
container.bind<Model<IUser & Document>>(TYPES.UserModel).toConstantValue(UserModel as unknown as Model<IUser & Document>);
container.bind<Model<IEmployer & Document>>(TYPES.EmployerModel).toConstantValue(EmployerModel as unknown as Model<IEmployer & Document>);
container.bind<Model<IChatMessage & Document>>(TYPES.ChatModel).toConstantValue(ChatModel as unknown as Model<IChatMessage & Document>);
container.bind<Model<IPosts & Document>>(TYPES.PostModel).toConstantValue(PostModel as unknown as Model<IPosts & Document>);
container.bind<Model<IReport & Document>>(TYPES.ReportModel).toConstantValue(ReportModel as unknown as Model<IReport & Document>);
container.bind<ChatService>(TYPES.ChatService).to(ChatService)
container.bind<otpService>(TYPES.OtpService).to(otpService)
container.bind<AuthService>(TYPES.AuthService).to(AuthService)
container.bind<AdminService>(TYPES.AdminService).to(AdminService)
container.bind<UserRepository>(TYPES.UserRepository).to(UserRepository)
container.bind<AdminRepository>(TYPES.AdminRepository).to(AdminRepository)
container.bind<AdminController>(TYPES.AdminController).to(AdminController)
container.bind<AuthController>(TYPES.AuthController).to(AuthController)
container.bind<ChatController>( TYPES.ChatController).to(ChatController)
container.bind<ConnectionService>(TYPES.ConnectionService).to(ConnectionService)
container.bind<EmployerService>(TYPES.EmployerService).to(EmployerService)
container.bind<InteractionService>(TYPES.InteractionService).to(InteractionService)
container.bind<ConnectionController>(TYPES.ConnectionController).to(ConnectionController)
container.bind<JobService>(TYPES.JobService).to(JobService)
container.bind<NotificationService>(TYPES.NotificationService).to(NotificationService)
container.bind<ChatRepository>(TYPES.ChatRepository).to(ChatRepository)
container.bind<NotificationController>(TYPES.NotificationController).to(NotificationController)
container.bind<ConnectionRepository>(TYPES.ConnectionRepository).to(ConnectionRepository)
container.bind<EmployerRepository>(TYPES.EmployerRepository).to(EmployerRepository)
container.bind<InteractionRepository>(TYPES.InteractionRepository).to(InteractionRepository)
container.bind<JobRepository>(TYPES.JobRepository).to(JobRepository)
container.bind<NotificationRepository>(TYPES.NotificationRepository).to(NotificationRepository)
container.bind<SocketHandler>(TYPES.SocketHandler).to(SocketHandler)
container.bind<EmployerController>(TYPES.EmployerController).to(EmployerController)
container.bind<InteractionController>(TYPES.InteractionController).to(InteractionController)
container.bind<JobController>(TYPES.JobController).to(JobController)
container.bind<AuthMiddleware>(TYPES.AuthMiddleware).to(AuthMiddleware)
container.bind<ReportRepository>(TYPES.ReportRepository).to(ReportRepository)
container.bind<ReportService>(TYPES.ReportService).to(ReportService)
export {container}