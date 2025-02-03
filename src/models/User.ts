import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/authTypes';
const userSchema = new Schema<IUser & Document>({
    firstName: { type: String },
    secondName: { type: String, },
    password: { type: String },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "employer"] },
    isProfileComplete:{type:Boolean,default:false},
    location: { type: String },
    experience: { type: String },
    skills: { type: [String], default: [] },
    resume: { type: [String], default: [] },
    profilePicture: { type: String },
    aboutMe: { type: String },
    dateOfBirth: { type: Date },
    phonenumber:{type:Number},
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    education: [
        {
            degree: { type: String },
            institution: { type: String },
            year: { type: Number }
        }
    ],
    languages: { type: [String], default: [] },
    isBlocked: { type: Boolean, default: false },
    connections: [{ type: Schema.Types.ObjectId, ref: 'Connection' }],
    jobApplicantionCount:{type:Number,default:0},
    isPremium: { type: Boolean, default: false },
    premiumExpiry:{type:Date}
});
const UserModel = mongoose.model<IUser>('User', userSchema);
export default UserModel;