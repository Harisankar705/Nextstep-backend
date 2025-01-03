import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const dbConnection = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_DB;
    if (!mongoUri) {
      throw new Error('MONGO_DB environment variable not found');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully!'); 
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB!');
  }
};
