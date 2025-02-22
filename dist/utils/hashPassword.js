"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const hashPassword = async (password) => {
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashed = await bcryptjs_1.default.hash(password, salt);
        return hashed;
    }
    catch (error) {
        throw error;
    }
};
exports.hashPassword = hashPassword;
const comparePassword = async (enteredPassword, storedHash) => {
    try {
        const isMatch = await bcryptjs_1.default.compare(enteredPassword, storedHash);
        return isMatch;
    }
    catch (error) {
        throw error;
    }
};
exports.comparePassword = comparePassword;
