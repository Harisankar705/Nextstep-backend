import { IApplicant, IChatMessage,IComments,IJob, INotification, IPosts, IReport, NotificationData, Reason } from './authTypes';
import { ConnectionStatus, IConnection, IEmployer, ILoginResponse, IUser } from '../types/authTypes';
import { Server } from 'http';
import { ObjectId } from 'mongodb';
import { IndividualDetailsDTO, ToggleUserDTO, VerifyUserDTO } from '../dtos/adminDTO';
export interface IAdminService {
    toggleUser(id: string, role: string): Promise<IUser | IEmployer|IApplicant|null>;
    getIndividualDetails(id: string,role:string): Promise<(IEmployer | IUser)[]>;
    verifyUser(id: string, status: "VERIFIED" | 'DENIED'): Promise<IEmployer|null>;
}
export interface IReportService
{
    createReport(reportData:IReport):Promise<IReport>
    getReports(filter?:object):Promise<IReport[]>
    changeReportStatus(reportId:string,newStatus:Reason):Promise<boolean>
}
export interface IAuthService {
    register(userData: IUser | IEmployer): Promise<IUser | IEmployer>;
    login(email: string, password: string, role: string): Promise<ILoginResponse>;
    updateUser(userId: string, userData: Partial<IUser>, profilePicturePath?: string, resume?: string): Promise<IUser | null>;
    createPostService(userId: string, postData: object, role: string): Promise<IPosts>;
    editPostService(postId: string, postData: object, role: string,userId:string): Promise<IPosts>;
    searchService(query: string): Promise<{users:IUser[];posts:IPosts[],employers:IEmployer[]}>;
    getUsersPosts(userId: string): Promise<IPosts[]>;
    getCandidateService(role: string): Promise<(IUser | IEmployer)[]>;
    
}
export interface IChatService {sendMessage(data: {sender: string;receiverId: string;content: string;status: "sent" | "delivered" | "read";file?: { data: string; name: string; type: string } | null;}): Promise<IChatMessage>;
    findMessageById(messageId: string): Promise<IChatMessage|null>;
    deleteMessage(messageId: string): Promise<boolean|null>;
    updateMessageStatus(messageId: string, status: "sent" | "delivered" | "seen"): Promise<IChatMessage|null>;
    getChat(id: string, userId: string): Promise<IChatMessage[]>;
    getMessagesForUser(userId: string): Promise<IChatMessage[]>;
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
  export interface INotificationService
  {
    getNotification(userId:string):Promise<NotificationData []>
    markNotificationAsRead(notificationId:string):Promise<INotification|null>
    createNotification(notificationData:NotificationData):Promise<NotificationData>
  }
  