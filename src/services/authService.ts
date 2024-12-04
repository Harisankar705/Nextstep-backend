import { UserRepository } from '../repositories/userRepository'
import { ILoginResponse, IUser, IEmployer } from '../types/authTypes'
import { comparePassword, hashPassword } from '../utils/hashPassword'
import { generateRefreshToken, generateToken } from '../utils/jwtUtils'
import UserModel from '../models/User'
import EmployerModel from '../models/Employer'
import otpService from './otpService'

function isEmployerRole(role: string): role is 'employer' {
    return role === 'employer';
}

class AuthService {
    private OtpInstance = new otpService()

    private validateRole(role: string): boolean {
        return ['user', 'employer'].includes(role);
    }

    async register(userData: IUser | IEmployer): Promise<IUser | IEmployer> {
        const userRepository = new UserRepository();

        if (!this.validateRole(userData.role)) {
            throw new Error('Invalid role. Must be "user" or "employer".');
        }

        const existingUser = await userRepository.findByEmail(userData.email, userData.role);
        if (existingUser) {
            throw new Error('User already exists!');
        }

        const hashedPassword = await hashPassword(userData.password || "");

        console.log("HASHEDPASSWORD", hashedPassword);

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
    }

    async login(email: string, password: string, role: string): Promise<ILoginResponse> {
        const userRepository = new UserRepository();

        console.log("IN AUTHSERVICE LOGIN");
        const user = await userRepository.findByEmail(email, role);
        console.log("USER", user);

        if (!user) {
            throw new Error('Invalid user');
        }

        const isMatch = await comparePassword(password, user.password || "");

        if (!isMatch) {
            throw new Error('Invalid password');
        }

        const accessToken:string = generateToken({ userId: (user._id as string).toString(), role: user.role });
        const refreshToken:string = generateRefreshToken({ userId: (user._id as string).toString(), role: user.role });
        const isProfileComplete:boolean=user.isProfileComplete||false
       
        return { accessToken, refreshToken, user,isProfileComplete };
    }


    async updateUser (userId: string, userData: Partial<IUser >, profilePicturePath?: string, resume?: string): Promise<IUser  | null> {
        const userRepository = new UserRepository();
        try {
            if (profilePicturePath) {
                userData.profilePicture = profilePicturePath; 
            }
            if (resume) {
                userData.resume = [resume] 
            }
    
            
            const updatedUser  = await userRepository.updateUser (userId, userData);
            if (!updatedUser ) {
                throw new Error("User  not found");
            }
    
            return updatedUser ;
        } catch (error) {
            console.error('Error occurred while updating user:', error);
            throw new Error(`Error occurred while updating user:`); 
        }
    }
}

export default AuthService;
