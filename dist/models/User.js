"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const userSchema = new mongoose_1.Schema({
    firstName: { type: String },
    secondName: { type: String, },
    password: { type: String },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "employer"] },
    isProfileComplete: { type: Boolean, default: false },
    location: { type: String },
    experience: { type: String },
    skills: { type: [String], default: [] },
    resume: { type: [String], default: [] },
    profilePicture: { type: String },
    aboutMe: { type: String },
    dateOfBirth: { type: Date },
    phonenumber: { type: Number },
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
    connections: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Connection' }],
    jobApplicantionCount: { type: Number, default: 0 },
    isPremium: { type: Boolean, default: false },
    premiumExpiry: { type: Date }
});
const UserModel = mongoose_1.default.model('User', userSchema);
exports.default = UserModel;
