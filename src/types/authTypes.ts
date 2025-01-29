import mongoose, { Document, mongo, ObjectId, Types } from "mongoose";
export interface IUser extends Document {
    _id: string | mongoose.Types.ObjectId;
    username?: string;
    isProfileComplete?: boolean,
    firstName?: string;
    secondName?: string;
    password?: string;
    email: string;
    role: "user";
    location?: string;
    experience?: string;
    skills?: string[];
    resume?: string[];
    profilePicture?: string;
    aboutMe?: string;
    dateOfBirth?: Date;
    gender?: string;
    education?: {
        degree?: string;
        institution?: string;
        year?: number;
    }[];
    languages?: string[];
    isBlocked?: boolean;
    connections?: string[];
    isPremium?: boolean;
    phonenumber?: number,
    jobApplicantionCount:number,
    premiumExpiry:Date,
    status: "Active" | "Inactive"
}
export interface JwtPayload
{
userId:string,
role:string,
iat:number,
exp:number
}

export interface IConnection extends Document
{
    followerId:mongoose.Schema.Types.ObjectId|string;
    followingId:mongoose.Schema.Types.ObjectId|string;
    isFollowBack:boolean;
    createdAt:Date
    updatedAt:Date
    status:ConnectionStatus
}

export interface IEmployer extends Document {
    _id: string | mongoose.Types.ObjectId,
    email: string
    password: string
    role: "employer"
    document:string,
    documentType:"GST"|"PAN"|"INCORPORATION"|"OTHER",
    isVerified:  "PENDING"|'APPROVED'|'REJECTED',
    documentNumber:string,
    logo: string,
    website: string,
    location: string,
    employees: string,
    industry: string,
    dateFounded: Date,
    description: string
    companyName: string
    isProfileComplete: boolean,
    status: "Active" | "Inactive"
}
export interface IAdmin extends Document {
    _id: string | mongoose.Types.ObjectId,
    email: string,
    password: string,
    role: "admin"
    isProfileComplete: boolean,
    status: "Active" | "Inactive"

}



export interface IGoogleAuth {
    tokenId: string
}
export interface ILoginResponse {
    accessToken: string
    refreshToken: string
    user: IUser | IEmployer | IAdmin
    isProfileComplete: boolean
}
export interface IPayLoad {
    userId: string
    role: "user" | 'employer' | 'admin'
}
export interface    IPosts extends Document
{
    userId:mongoose.Types.ObjectId,
    userType:'user'|'employer',
    text:string,
    image:string[],
    background?:string,
    location:string,
    createdAt:Date,
    comments:mongoose.Types.ObjectId[],
    likes:mongoose.Types.ObjectId[]
}
export interface Like {
    _id: ObjectId;
    postId: ObjectId;
    userId: ObjectId;
    createdAt: Date;
}
export interface ISavedPost
{
    userId:string,
    postIds:string,
    createdAt:Date
}
export enum ConnectionStatus
{
    FOLLOWBACK='followback',
    REJECTED='rejected',
    NOTFOLLOWINGBACK='notfollowingback'

}
export interface JobData
{
    formData:{
        employerId:Types.ObjectId|string,
    
        jobTitle:string
        description:string,
        employmentTypes:string[],
        salaryRange: {
            min: number,
            max: number
        },
        categories: string[],
        skills: string[],
        responsibilities:string,
        whoYouAre: string,
        niceToHave?: string,
        benefits: string[]
        createdAt: Date, 
        isActive: boolean
    }
    

}
export interface Filters {
    search?: string; 
    jobTypes?: string[]; 
    experienceLevels?: string[]; 
};
export interface InterviewScheduleData {
    date: string;
    time: string;
    interviewer: string;
    platform: string;
    meetingLink?: string;
  }
export interface NotificationData{
    senderId:string,
    recipientId?:string,
    type:string,
    content:string,
    link:string
}
export const notificationTypes={
    LIKE_POST:'like_post',
    COMMENT_POST:'comment_post',
    FOLLOW_USER:'follow_user',
}
export interface IApplicant extends Document {
    jobId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    applicationStatus: 'pending' | 'accepted' | 'rejected' | 'interviewScheduled' | 'interviewCompleted';
    appliedAt: Date;
    resume?: string; 
    coverLetter?: string;
    interviewSchedule?: {
      date: string;
      time: string;
      interviewer: string;
      platform: 'video' | 'phone' | 'in-person';
      meetingLink?: string;
    };
    notes?: string;
  }
export interface CandidateData {
    experience: string;
    languages: string[];
    location: string;
    aboutMe: string;
    education: {
      degree?: string;
      year?: number;
      institution?: string;
    }[];
    dateofbirth: Date;
    gender: string;
    skills: string[];
  }
  export interface JwtPayload
{
userId:string,
role:string,
iat:number,
exp:number
}
export interface ChatMessage{
    _id:Types.ObjectId;
    senderId:Types.ObjectId,
    receiverId:Types.ObjectId,
    content:string,
    type:'text'|'image'|'document',
    timestamp:Date,
    file?:{
        
            name:string
            type:string
            url:string
        
    }|null
    senderRole:"User"|'Employer';
    receiverRole:"User"|'Employer'
    isDeleted:boolean,
    status:'sent'|'delivered'|'read',
    seenAt?:Date,
    deliveredAt?:Date
}