import crypto from 'crypto'
import nodemailer from 'nodemailer'
import { UserRepository } from '../repositories/userRepository'

class otpService {
    private userRepository = new UserRepository()
    private generateOtp(): string {
        return crypto.randomInt(100000, 999999).toString()

    }
    async sendOTP(email: string, role: 'user' | 'employer'): Promise<void> {
        const otp = this.generateOtp()
        const otpExpiry = new Date(Date.now() * 5 * 60 * 1000)
        if (role === 'user') {
            await this.userRepository.updateUser(email, { otp, otpExpiry, role })
        }
        else {

        }


        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })
        const mailOption = {
            from: "nextstep@gmail.com",
            to: email,
            subject: "Your otp for nextstep is",
            text: `Your OTP code is ${otp} It will expire in 5 minutes`
        }
        await transporter.sendMail(mailOption)
    }
    async verifyOtp(email: string, otp: string, role: "user" | "employer"): Promise<boolean> {
        let userOrEmployer
        if (role === 'user') {
            userOrEmployer = await this.userRepository.findByEmail(email)
        }
        else {
            // userOrEmployer=await this.employerRepository.findByEmail(email)
        }
        if (!userOrEmployer || !userOrEmployer.otp) {
            throw new Error('invalid or expired otp')
        }
        const isValidOtp = userOrEmployer.otp === otp && userOrEmployer.otpExpiry && userOrEmployer.otpExpiry > new Date()
        if (isValidOtp) {
            await this.userRepository.updateUser(email, { otp: null, otpExpiry: null })
        }
        else {

        }
        return userOrEmployer.otp === otp

    }
    async saveUserWithPassword(email: string, password: string, role: "user" | "employer"): Promise<void> {
        if (role === 'user') {
            const user = await this.userRepository.findByEmail(email)
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