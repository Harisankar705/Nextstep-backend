import { Document, FilterQuery, Model } from 'mongoose';
import { ConnectionStatus, Filters, IApplicant, IChatMessage, IComments, IConnection, IEmployer, IJob, ILike, InterviewScheduleData, IPosts, IReport, IUser, JobData, NotificationData, Reason } from "../types/authTypes";
import UserModel from '../models/User';
import EmployerModel from '../models/Employer';

export interface INotificationRepository {
  createNotification(notificationData: NotificationData): Promise<Document>;
  getNotificationForUser(userId: string): Promise<NotificationData[]>;
  markNotificationAsRead(notificationId: string): Promise<Document | null>;
}
export interface IReportRepository {
  createReport(reportData:IReport):Promise<IReport>
  changeStatus(reportId:string,newStatus:Reason):Promise<boolean>
  getReports(filter?:object):Promise<IReport[]>
}

export interface IEmployerRepository {
    updateUser(
      userId: string,
      userData: Partial<IEmployer>
    ): Promise<IEmployer | null>;
  
    isVerified(employerId: string): Promise<boolean>;
  }
  export interface IConnectionRepository {
    findExisitingConnection(followerId: string, followingId: string): Promise<IConnection | null>;
  
    getUserConnection(userId: string): Promise<IConnection[]>;
  
    getPendingRequests(userId: string): Promise<IConnection[]>;
  
    getSendRequests(userId: string): Promise<IConnection[]>;
  
    find(query: FilterQuery<IConnection>): Promise<IConnection[]>;
  
    findWithPopulate(query: FilterQuery<IConnection>): Promise<IConnection[]>;
  
    updateConnectionStatus(userId: string, connectionId: string, status: ConnectionStatus): Promise<IConnection | null>;
  
    getMutualConnection(userId1: string, userId2: string): Promise<IConnection[]>;
  }
  export interface IChatRepository {
    saveMessage(data: IChatMessage): Promise<IChatMessage>;
  
    getMessages(id: string, userId: string): Promise<IChatMessage[]>;
  
    updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'seen'): Promise<IChatMessage|null>;
  
    getMessagesForUser(userId: string): Promise<IChatMessage[]>;
  
    deleteMessageById(messageId: string): Promise<IChatMessage|null>;
  }
  export interface IAdminRepository {
    changeUserStatus(
      model: Model<IUser|IEmployer|IApplicant>,id:string
    ): Promise<IUser | IEmployer|IApplicant|null>;
  
    updateVerificationStatus(
      id: string,
      status: "VERIFIED" | "DENIED"
    ): Promise<IEmployer|null>;
  }
  export interface IInteractionRepository
  {
    createLike(userId: string, postId: string):Promise<ILike|null>
    removeLike(userId: string, postId: string):Promise<ILike | null>
    getLikeCount(postId: string):Promise<number>
    savePost(userId: string, postId: string):Promise<IPosts|null>
    getSavedPost(userId: string):Promise<IPosts|null>
    getCommentCount(postId: string):Promise<number>
    checkUserLiked(userId: string, postId: string):Promise<ILike|null>
    createComment(userId: string, postId: string, comment: string, commentorModel: string):Promise<IComments>
    getComments(postId: string):Promise<IComments[]>
    getPostById(postId: string):Promise<IPosts|null>
  }