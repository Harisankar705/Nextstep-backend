import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    _id: string | mongoose.Types.ObjectId;
    username?: string;
    isProfileComplete?:boolean,
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
    phonenumber?:number
}


export interface IEmployer extends Document
{
    _id:string|mongoose.Types.ObjectId,
    email:string
    password:string
    role:"employer"
    companyName:string
    isProfileComplete:boolean
}



export interface IOTP {
    otp: string,
    email: string
}

export interface IGoogleAuth {
    tokenId: string
}
export interface ILoginResponse {
    accessToken: string
    refreshToken:string
    user: IUser|IEmployer
    isProfileComplete:boolean
}
export interface IPayLoad
{
    userId:string
    role:"user"|'employer'
}