"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const dbConnection = async () => {
    try {
        const mongoUri = process.env.MONGO_DB;
        if (!mongoUri) {
            throw new Error('MONGO_DB environment variable not found');
        }
        await mongoose_1.default.connect(mongoUri);
    }
    catch (error) {
        throw error;
    }
};
exports.dbConnection = dbConnection;
