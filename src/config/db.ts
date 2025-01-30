import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { NextFunction } from 'express';
dotenv.config();
export const dbConnection = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_DB;
    if (!mongoUri) {
      throw new Error('MONGO_DB environment variable not found');
    }
    await mongoose.connect(mongoUri);
  } catch (error) {
    throw error
  }
};
