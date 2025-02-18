import { Transporter } from 'nodemailer';
import { inject, injectable } from "inversify";
import { TYPES } from '../types/types';

@injectable()
export class EmailService{
    constructor(@inject(TYPES.Transporter)private tranporter:Transporter){}
    async sendEmail(to:string,subject:string,text:string)
    {
        const emailOptions={
            from:process.env.EMAIL_USER,
            to,
            subject,
            text,
        }
        try {
            await this.tranporter.sendMail(emailOptions)
            console.log('Email sended successfully!')
        } catch (error) {
            throw new Error("Error occured while sending automated email!")
        }
    }

}