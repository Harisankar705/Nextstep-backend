import mongoose, { Document } from "mongoose";
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


export interface IEmployer extends Document {
    _id: string | mongoose.Types.ObjectId,
    email: string
    password: string
    role: "employer"
    gstNumber: string,
    panNumber: string,
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


export interface IOTP {
    otp: string,
    email: string
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