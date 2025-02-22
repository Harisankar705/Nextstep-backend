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
const employerSchema = new mongoose_1.Schema({
    companyName: { type: String, required: false },
    password: { type: String, required: false },
    email: { type: String, required: false },
    logo: { type: String },
    location: { type: String, required: false },
    employees: { type: String, required: false },
    industry: { type: String, required: false },
    dateFounded: { type: Date, required: false },
    description: { type: String, required: false },
    document: { type: String },
    documentType: { type: String, enum: ["GST", "PAN", "INCORPORATION", "OTHER"] },
    isVerified: { type: String, enum: ["PENDING", 'APPROVED', 'REJECTED'], default: "PENDING" },
    documentNumber: { type: String },
    website: { type: String, required: false },
    role: { type: String, default: 'employer' },
    isProfileComplete: { type: Boolean, default: false },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    jobs: [{ type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Job' }],
});
const EmployerModel = mongoose_1.default.model("Employer", employerSchema);
exports.default = EmployerModel;
