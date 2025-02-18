import mongoose, { Document, ObjectId, Types } from "mongoose";
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
    profilePicture?: string
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
export type Reason='spam'|'inappropirate'|'offensive'|'misinformation'|'sexual content'|'other'
export interface CustomError extends Error
{
    status?:number
}
export interface JwtPayload
{
userId:string,
role:string,
iat:number,
exp:number
}
export interface INotification extends Document
{
    recipientId:mongoose.Types.ObjectId,
    sender:mongoose.Types.ObjectId,
    senderModel:"User"|"Employer",
    type: 
        | "post_like"
        | "post_comment"
        | "friend_request"
        | "friend_request_accepted"
        | "new_message"
        | "job_application"
        | "job_application_update";
    content:string,
    link?:string,
    read:boolean,
    createdAt:Date
}
export type ApplicationStatus = 'pending' | 'accepted' |'in-review'|'shortlisted'| 'rejected' |'interview'| 'interviewScheduled' | 'interviewCompleted';
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
    isVerified:  "PENDING"|'APPROVED'|'REJECTED'|'VERIFIED',
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
    jobs:mongoose.Types.ObjectId
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
    postIds?:string
    createdAt:Date,
    comments:mongoose.Types.ObjectId[],
    likes:ILike[]
}
export interface IReport extends Document {
    post:mongoose.Types.ObjectId,
    reporter: mongoose.Types.ObjectId
    reporterModel:"User"|"Employer"   
    reason:Reason
    description?:string,
    createdAt:Date,
    status:string

}
export interface ILike {
    _id: ObjectId|string;
    postId: ObjectId|string;
    userId: ObjectId|string;
    createdAt: Date;
}
export interface ICommentor
{
    _id:string,
    firstName?:string
    secondName?:string,
    profilePicture?:string,
    logo?:string
    companyName?:string
}
export interface IComments {
    _id?: Types.ObjectId|string,
    postId: ObjectId|string,
    userId: ObjectId|string,
    commentorModel?:"User"|"Employer",
    comment: string;
    commentor?:ICommentor|null
    likes: ILike[]
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
        employerId:Types.ObjectId|string|undefined
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
    read?:boolean,
    senderDetails?:{
        companyName?:string,
        logo?:string,
        profilePicture?:string,
        firstName?:string
    }
    createdAt?:Date
}
export const notificationTypes={
    LIKE_POST:'like_post',
    COMMENT_POST:'comment_post',
    FOLLOW_USER:'follow_user',
}
export interface IApplicant extends Document {
    jobId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    applicationStatus: ApplicationStatus;
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
export interface IJob extends Document {
    _id: string;
    jobTitle: string;
    description: string;
    employerId: ObjectId;
    employmentTypes: string[];
    applicantsCount: number;
    applicationDeadline: Date;
    isActive: boolean;
    salaryRange:{
        min:number,
        max:number
    }
    industry:string[]
    categories:string[]
    skills:string[],
    responsibilities:string
    whoYouAre:string,
    niceToHave:string
    benefits:string[]
    createdAt: Date;
    applicants:ObjectId
  }

export interface IChatMessage extends Document{
    _id:Types.ObjectId|string;
    senderId:Types.ObjectId|string,
    receiverId:Types.ObjectId|string,
    content:string,
    type:'text'|'image'|'document',
    timestamp:Date,
    file?:{
            name:string
            type:string
            url:string
    }|null
    isDeleted:boolean,
    status:'sent'|'delivered'|'read',
    seenAt?:Date,
    deliveredAt?:Date
}

export interface IUploadedFile {
    filepath: string;
    originalFilename: string;
    mimetype: string;
    size: number;
}

export interface IUploadedFiles {
    [key: string]: undefined | IUploadedFile[];
}

export interface IUploadedFields {
    [key: string]: string | string[] | undefined;
}
export interface VideoCallOffer
{
    senderId:string,
    receiverId:string,
    offer:RTCSessionDescriptionInit
}
export interface VideoCallAnswer
{
    senderId:string,
    receiverId:string,
    answer:RTCSessionDescriptionInit
}
export interface newIceCandidate
{
    senderId:string,
    receiverId:string,
    candidate:RTCIceCandidate
}
export interface LikePostData
{
    userId:string,
    recipient:string,
    postId:string,
    content:string,
    link:string
}
export interface CommentPostData
{
    userId:string,
    postId:string,
    comment:string
}
export enum EmployerDocumentType
{
    GST="GST",
    PAN='PAN',
    INCORPORATION='INCORPORATION',
    OTHER='OTHER'

}