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
    premium?: boolean;
    phonenumber?: number,
    status: "Active" | "Inactive"
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
export enum ConnectionStatus
{
    FOLLOWBACK='followback',
    REJECTED='rejected',
    NOTFOLLOWINGBACK='notfollowingback'

}
export interface JobData
{
    employerId:Types.ObjectId|string,

    jobTitle:string
    description:string,
    employmentTypes:string[],
    salaryRange: {
        min: number,
        max: number
    },
    categories: string[],
    requiredSkills: string[],
    responsibilities:string,
    whoYouAre: string,
    niceToHave?: string,
    benefits: string[]
    createdAt: Date, 
    isActive: boolean

}