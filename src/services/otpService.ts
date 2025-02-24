import crypto from 'crypto'
import nodemailer, { Transporter } from 'nodemailer'
import { UserRepository } from '../repositories/userRepository'
import { IOtpService } from '../types/serviceInterface';
import { inject } from 'inversify';
import { TYPES } from '../types/types';
const otpStore: { [key: string]: { otp: string, expiry: Date } } = {};
class otpService implements IOtpService{
    private userRepository:UserRepository
    private transporter:Transporter
    constructor(@inject(TYPES.UserRepository)userRepository:UserRepository,@inject(TYPES.Transporter)transporter:Transporter)
    {
        this.userRepository =userRepository
        this.transporter=transporter
    }
    
    private generateOtp(): string {
        return crypto.randomInt(100000, 999999).toString()
    }
    async sendOTP(email: string, role: 'user' | 'employer'): Promise<void> {
        const otp = this.generateOtp()
        const otpExpiry = new Date(Date.now() + 5 *  60 * 1000)
        otpStore[email] = { otp, expiry: otpExpiry }
        console.log(otpStore[email])
       
        const mailOption = {
            from: "nextstep@gmail.com",
            to: email,
            subject: "Your otp for nextstep is",
            text: `Your OTP code is ${otp} It will expire in 5 minutes`
        }
        await this.transporter.sendMail(mailOption)
    }
    async resendOTP(email:string,role:'user'|"employer",):Promise<void>{
        const otpData=otpStore[email]
        if(otpData && otpData.expiry>new Date())
        {
              console.log('sending otp')
        }
        else
        {
            const otp = this.generateOtp()
            const otpExpiry = new Date(Date.now() + 5 * 60 * 1000)
            otpStore[email] = { otp, expiry: otpExpiry }
            await this.sendOTP(email, role)        }
    }
    async verifyOtp(email: string, otp: string, role: "user" | "employer"): Promise<boolean> {
        const otpData = otpStore[email];
        if (!otpData) {
           throw new Error("OTP not found!")
        }
        const { otp: storedOtp, expiry } = otpData
        console.log('stored otp',{storedOtp,expiry})
        const isValidOtp = storedOtp === otp && expiry > new Date()
        if (isValidOtp) {
            otpStore[email] = { otp: "", expiry: new Date(0) }
        }
        return isValidOtp
    }
    async saveUserWithPassword(email: string, password: string, role: "user" | "employer"): Promise<void> {
        if (role === 'user') {
            const user = await this.userRepository.findByEmail(email,role)
            if (!user) throw new Error('user not found')
            await this.userRepository.updateUser(email, { password })
        }
        else {
            // const employer=await this.employerRepository.findByEmail(email)
            // if(!employer)throw new Error('employer not found')
        }
    }
}
export default otpService