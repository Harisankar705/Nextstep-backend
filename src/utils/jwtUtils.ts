import jwt from 'jsonwebtoken'
import { IPayLoad } from '../types/authTypes'
const JWT_SECRET = process.env.JWT_SECRET as string
export const generateToken = (payload: IPayLoad): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" })
}
export const verifyToken = (token: string): IPayLoad | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as IPayLoad
    } catch (error) {
        return null
    }
}