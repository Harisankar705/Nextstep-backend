import mongoose from 'mongoose'
require('dotenv').config()
export const dbConnection = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_DB as string
        if (!mongoUri) {
            throw new Error('mongouri not found')
        }
        await mongoose.connect(mongoUri)
    } catch (error) {
        console.log('error occured while dbconnection', error)
    }
}