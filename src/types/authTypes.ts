import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    _id:string|mongoose.Types.ObjectId,
    username?:string
    firstName?: string;
    secondName?: string;
    password?: string;
    email: string;
    role:"user",

    profile?: {
        firstName?: string;
        secondName?: string;
        location?: string;
        experience?: string;
        technicalSkills?: string[];
        resume?: string[];
        profilePicture?: string;
        aboutMe?: string;
        dateOfBirth?: Date;
        
    };
    education?: {
        degree?: string;
        institution?: string;
        year?: number;
    }[];
    languages?: string[];
    isBlocked?: boolean;
    connections?: string[]; 
    premium?: boolean;
    
}

export interface IEmployer extends Document
{
    _id:string|mongoose.Types.ObjectId,
    email:string
    password:string
    role:"employer"
    companyName:string
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
}
export interface IPayLoad
{
    userId:string
    role:"user"|'employer'
}