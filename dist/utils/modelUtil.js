"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSenderData = void 0;
exports.getModel = getModel;
const Employer_1 = __importDefault(require("../models/Employer"));
const User_1 = __importDefault(require("../models/User"));
const admin_1 = __importDefault(require("../models/admin"));
function getModel(role) {
    if (role === 'employer') {
        return Employer_1.default;
    }
    if (role === 'user') {
        return User_1.default;
    }
    if (role === 'admin') {
        return admin_1.default;
    }
    throw new Error(`invalid role${role}`);
}
const getSenderData = async (senderId) => {
    const [employer, user] = await Promise.all([
        Employer_1.default.findById(senderId),
        User_1.default.findById(senderId)
    ]);
    if (employer) {
        return employer;
    }
    else {
        return user;
    }
};
exports.getSenderData = getSenderData;
