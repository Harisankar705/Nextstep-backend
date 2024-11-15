import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types/authTypes';

const userSchema = new Schema<IUser>({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    otp:{type:String,default:null},
    otpExpiry:{type:Date,default:null},
    role:'user',
    profile: {
        firstName: { type: String },
        secondName: { type: String },
        location: { type: String },
        experience: { type: String },
        technicalSkills: { type: [String], default: [] },
        resume: { type: [String], default: [] },
        profilePicture: { type: String },
        aboutMe: { type: String },
        dateOfBirth: { type: Date }
    },
    education: [
        {
            degree: { type: String },
            institution: { type: String },
            year: { type: Number }
        }
    ],
    languages: { type: [String], default: [] },
    isBlocked: { type: Boolean, default: false },
    connections: [{ type: Schema.Types.ObjectId, ref:'User' }],
    premium:{type:Boolean , default:false}
});

const UserModel = mongoose.model<IUser>('User', userSchema);
export default UserModel;