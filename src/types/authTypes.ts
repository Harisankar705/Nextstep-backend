import { Document } from "mongoose";
export interface IUser extends Document {
    _id:string
    username: string;
    password: string;
    email: string;
    role:"user",
    otp:string|null,
    otpExpiry:Date|null

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




export interface IOTP {
    otp: string,
    email: string
}

export interface IGoogleAuth {
    tokenId: string
}
export interface ILoginResponse {
    token: string
    user: IUser
}
export interface IPayLoad
{
    userId:string
    role:'candidate'|"user"|'admin'
}