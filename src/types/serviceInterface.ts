import { ApplicationStatus, Filters, IApplicant, IJob, InterviewScheduleData, IPosts, JobData } from './authTypes';
import { ConnectionStatus, IConnection, IEmployer, ILoginResponse, IUser } from '../types/authTypes';
import { IComment } from '../models/comment';
export interface IAdminService {
    toggleUser(id: string, role: string): Promise<IUser | IEmployer>;
    getIndividualDetails(id: string, role: string): Promise<(IEmployer | IUser)[]>;
    verifyUser(id: string, status: "VERIFIED" | "DENIED"): Promise<any>;
}
export interface IAuthService {
    register(userData: IUser | IEmployer): Promise<IUser | IEmployer>;
    login(email: string, password: string, role: string): Promise<ILoginResponse>;
    updateUser(userId: string, userData: Partial<IUser>, profilePicturePath?: string, resume?: string): Promise<IUser | null>;
    createPostService(userId: string, postData: object, role: string): Promise<any>;
    searchService(query: string): Promise<any>;
    getUsersPosts(userId: string): Promise<any>;
    getCandidateService(role: string): Promise<(IUser | IEmployer)[]>;
}
export interface IChatService {sendMessage(data: {sender: string;receiverId: string;content: string;status: "sent" | "delivered" | "seen";file?: { data: string; name: string; type: string } | null;}): Promise<any>;
    findMessageById(messageId: string): Promise<any>;
    deleteMessage(messageId: string): Promise<any>;
    updateMessageStatus(messageId: string, status: "sent" | "delivered" | "seen"): Promise<any>;
    getChat(id: string, userId: string): Promise<any>;
    getMessagesForUser(userId: string): Promise<any>;
}
export interface IConnectionService {
    followUser(followerId: string, followingId: string): Promise<boolean>;
    getConnections(userId: string): Promise<IConnection[]>;
    respondToRequest(userId: string, connectionId: string, status: ConnectionStatus): Promise<IConnection | null>;
    getMutualConnections(userId1: string, userId2: string): Promise<IConnection[]>;
    checkFollowStatus(currentUser: string, checkUser: string): Promise<boolean>;
    unfollow(followerId: string, followingId: string): Promise<void>;
    getPendingRequest(userId: string): Promise<IConnection[]>;
}
export interface IEmployerService {
    updateUser(userId: string, userData: Partial<IEmployer>, logoPath?: string): Promise<IEmployer | null>;
    isVerified(employerId: string): Promise<boolean>;
}
export interface IOtpService {
    sendOTP(email: string, role: 'user' | 'employer'): Promise<void>;
    resendOTP(email: string, role: 'user' | 'employer'): Promise<void>;
    verifyOtp(email: string, otp: string, role: 'user' | 'employer'): Promise<boolean>;
    saveUserWithPassword(email: string, password: string, role: 'user' | 'employer'): Promise<void>;
  }