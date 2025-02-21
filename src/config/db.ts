import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
export const dbConnection = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_DB;
    console.log("MONGOURI",mongoUri)
    if (!mongoUri) {
      throw new Error('MONGO_DB environment variable not found');
    }
    await mongoose.connect(mongoUri);
  } catch (error) {
    throw error
  }
};
