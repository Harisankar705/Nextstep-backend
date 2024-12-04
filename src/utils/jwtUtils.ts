import dotenv from 'dotenv'
dotenv.config()
import jwt from 'jsonwebtoken'
import { IPayLoad } from '../types/authTypes'
const ACCESS_TOKEN = process.env.ACCESS_TOKEN as string
const REFRESH_TOKEN=process.env.REFRESH_TOKEN as string
export const generateToken = (payload: IPayLoad): string => {
    return jwt.sign(payload, ACCESS_TOKEN, { expiresIn: "1h" })
}
export const verifyToken = (token: string,type:"access"|"refresh"): IPayLoad | null => {
    const secret=type==='access'?ACCESS_TOKEN:REFRESH_TOKEN
    try {
        return jwt.verify(token,secret) as IPayLoad
    } catch (error) {
        return null
    }
}
export const generateRefreshToken=(payload:IPayLoad):string=>{
    return jwt.sign(payload,REFRESH_TOKEN,{expiresIn:'7days'})
}
