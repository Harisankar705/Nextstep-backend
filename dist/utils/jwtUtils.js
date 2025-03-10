"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRefreshToken = exports.verifyToken = exports.generateToken = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, ACCESS_TOKEN, { expiresIn: "1h" });
};
exports.generateToken = generateToken;
const verifyToken = (token, type) => {
    const secret = type === 'access' ? ACCESS_TOKEN : REFRESH_TOKEN;
    try {
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        throw error;
    }
};
exports.verifyToken = verifyToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, REFRESH_TOKEN, { expiresIn: '7days' });
};
exports.generateRefreshToken = generateRefreshToken;
