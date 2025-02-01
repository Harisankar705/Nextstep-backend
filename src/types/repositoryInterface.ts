import { Document } from 'mongoose';
import { ConnectionStatus, Filters, IConnection, IEmployer, InterviewScheduleData, JobData } from "../types/authTypes";
import UserModel from '../models/User';
import EmployerModel from '../models/Employer';

export interface INotificationRepository {
  createNotification(notificationData: any): Promise<Document>;
  getNotificationForUser(userId: string): Promise<any[]>;
  markNotificationAsRead(notificationId: string): Promise<Document | null>;
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
  
    find(query: any): Promise<IConnection[]>;
  
    findWithPopulate(query: any): Promise<IConnection[]>;
  
    updateConnectionStatus(userId: string, connectionId: string, status: ConnectionStatus): Promise<IConnection | null>;
  
    getMutualConnection(userId1: string, userId2: string): Promise<IConnection[]>;
  }
  export interface IChatRepository {
    saveMessage(data: Record<string, any>): Promise<any>;
  
    getMessages(id: string, userId: string): Promise<any[]>;
  
    updateMessageStatus(messageId: string, status: 'sent' | 'delivered' | 'seen'): Promise<any>;
  
    getMessagesForUser(userId: string): Promise<any[]>;
  
    deleteMessageById(messageId: string): Promise<any>;
  }
  export interface IAdminRepository {
    changeUserStatus(
      model: typeof UserModel | typeof EmployerModel,
      id: string
    ): Promise<any>;
  
    updateVerificationStatus(
      id: string,
      status: "VERIFIED" | "DENIED"
    ): Promise<any>;
  }
  