import  jwt  from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import { inject } from 'inversify';
import { UserRepository } from './../repositories/userRepository';
import { IEmployer, ILoginResponse, IPosts, IUser } from './../types/authTypes';
import { comparePassword, hashPassword } from '../utils/hashPassword'
import { generateRefreshToken, generateToken } from '../utils/jwtUtils'
import UserModel from '../models/User'
import EmployerModel from '../models/Employer'
import otpService from './otpService'
import { IAuthService } from '../types/serviceInterface';
import { Transporter } from 'nodemailer';
import { injectable } from 'inversify';
import { TYPES } from '../types/types';
import crypto from 'crypto'
import { getModel } from '../utils/modelUtil';
import { Model, model } from 'mongoose';
import { container } from '../utils/inversifyContainer';
import { EmailService } from '../utils/emailService';
import { OAuth2Client } from 'google-auth-library';
function isEmployerRole(role: string): role is 'employer' {
    return role === 'employer';
}
const client=new OAuth2Client(process.env.AUTH_GOOGLE_ID)

@injectable()
export class AuthService implements IAuthService {

    constructor(@inject(TYPES.UserRepository) private userRepository: UserRepository, @inject(TYPES.Transporter) private transporter: Transporter, @inject(TYPES.OtpService) private OtpInstance: otpService) { }
    private validateRole(role: string): boolean {
        return ['user', 'employer'].includes(role);
    }
    async createPostService(userId: string, postData: object, role: string) {
        const response = await this.userRepository.createPost(postData, role, userId)
        return response as IPosts
    }
    async editPostService(postId: string, updatedData: IPosts, role: string, userId: string) {
        const response = await this.userRepository.editPost(postId, updatedData, role, userId)
        return response as IPosts
    }
    async searchService(query: string) {
        try {
            if (!query.trim()) {
                throw new Error("Query not given for search")
            }
            const results = await this.userRepository.search(query)
            return results
        } catch (error) {
            throw new Error("Error occured during searching")
        }
    }
    async register(userData: IUser | IEmployer): Promise<IUser | IEmployer> {
        try {
            if (!this.validateRole(userData.role)) {
                throw new Error('Invalid role. Must be "user" or "employer".');
            }
            const existingUser = await this.userRepository.findByEmail(userData.email, userData.role);
            if (existingUser) {
                throw new Error('User already exists!');
            }
            const hashedPassword = await hashPassword(userData.password || "");
            let newUser;
            if (isEmployerRole(userData.role)) {
                newUser = new EmployerModel({
                    ...userData,
                    password: hashedPassword
                });
            } else {
                newUser = new UserModel({
                    ...userData,
                    password: hashedPassword
                });
            }
            await newUser.save();
            return newUser;
        } catch (error) {
            throw error;
        }
    }
    async getUsersPosts(userId: string): Promise<IPosts[]> {
        try {
            const posts = await this.userRepository.findUserPosts(userId)
            return posts as IPosts[]
        } catch (error) {
            throw error;
        }
    }

    async login(email: string, password: string, role: string): Promise<ILoginResponse> {
        try {
            const user = await this.userRepository.findByEmail(email, role);
            if (!user) {
                throw new Error('User not found! Try Signup!');
            }
            const isMatch = await comparePassword(password, user.password || "");
            if (!isMatch) {
                throw new Error("invalid email or password")
            }
            const accessToken: string = generateToken({ userId: (user._id as string).toString(), role: user.role });
            const refreshToken: string = generateRefreshToken({ userId: (user._id as string).toString(), role: user.role });
            const isProfileComplete: boolean = user.isProfileComplete || false
            return { accessToken, refreshToken, user, isProfileComplete };
        }
        catch (error: unknown) {
            console.log("ERROR WHILE LOGIN", error)
            if (error instanceof Error) {
                throw new Error(`${error.message}`);
            } else {
                throw new Error(`Error login`);
            }
        }

    }
    async updateUser(userId: string, userData: Partial<IUser>, profilePicturePath?: string, resume?: string): Promise<IUser | null> {
        try {
            if (profilePicturePath) {
                userData.profilePicture = profilePicturePath;
            }
            if (resume) {
                userData.resume = [resume]
            }
            const updatedUser = await this.userRepository.updateUser(userId, userData);
            if (!updatedUser) {
                throw new Error("User  not found");
            }
            return updatedUser;
        } catch (error) {
            throw new Error(`Error occurred while updating user:`);
        }
    }
    async requestPasswordReset(email: string, role: string) {
        try {
            const model = await getModel(role) as Model<IUser | IEmployer>
            const user = await model.findOne({ email })
            if (!user) {
                console.log("USER NOT FOUND")
                throw new Error("User not found!")
            }
            const resetToken = crypto.randomBytes(32).toString('hex')
            const resetTokenExpiration = new Date(Date.now() + 3600000); 
            user.resetPasswordToken = resetToken
            user.resetPasswordExpires = resetTokenExpiration
            await user.save()
            console.log("EMAIL SENDED")
            const resetLink = `http://${process.env.FRONTEND_URL}/reset-password/${resetToken}`


            const subject = "Password Reset Request"
            const text = `Hello,\n\nYou are receiving this email because you (or someone else) requested a password reset for your account.\n\nPlease click on the following link to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email.`;

            const emailService = container.get<EmailService>(TYPES.EmailService)
            await emailService.sendEmail(email, subject, text)


        } catch (error) {
            console.log(error)
            throw new Error('Error occured while requesting reset password')
        }

    }
    async verifyGoogleToken(token:string)
    {
        const ticket=await client.verifyIdToken({
            idToken:token,
            audience:process.env.AUTH_GOOGLE_ID
        })
        return ticket.getPayload()
    }
    async authenticateGoogleUser(token: string, role: string) {
        const payload = await this.verifyGoogleToken(token);
        if (!payload) {
            throw new Error("Invalid Google token!"); 
        }
        const { email, sub: googleId, name, picture } = payload;
    
        const model = getModel(role) as Model<IUser | IEmployer>; 
        if (!model) {
            throw new Error("Invalid role provided!");
        }
    
        let user = await model.findOne({ email });
    
        if (!user) {
            user = await model.create(
                role === "user"
                    ? { email, googleId, firstName: name, profilePicture: picture }
                    : { email, googleId, companyName: name, logo: picture } 
            );
        }
    
        const accessToken = jwt.sign(
            { userId: user._id, role }, 
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
        );
        const refreshToken=jwt.sign({userId:user._id,role},
            process.env.JWT_REFRESH_SECRET||process.env.JWT_SECRET!,
            {expiresIn:'7d'}
        )
    
        return { user, accessToken,refreshToken};
    }
    
    async resetPassword(password: string, token: string, role: string) {
        try {
            const model = await getModel(role) as Model<IUser | IEmployer>
            console.log(model)
            const user = await model.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            })
            if (!user) {
                throw new Error("User not found!")
            }
            user.password = await bcrypt.hash(password, 10)
            user.resetPasswordToken = undefined
            user.resetPasswordExpires = undefined
            await user.save()
            console.log("EMAIL SENDED")
        } catch (error) {
            console.log("ERROR",error)
        }

    }
    async getCandidateService(role: string): Promise<(IUser | IEmployer)[]> {
        try {
            if (role !== 'user' && role !== 'employer') {
                throw new Error("invalid role provided")
            }
            let candidates: (IUser | IEmployer)[] = [];
            if (role === 'user') {
                candidates = await UserModel.find()
            }
            if (role === 'employer') {
                candidates = await EmployerModel.find()
            }
            return candidates
        }
        catch (error) {
            throw new Error(`Error occurred getcandidateservice`);
        }
    }
}
