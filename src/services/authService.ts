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

    // Modify the register method to handle role-specific logic
    async register(userData: IUser | IEmployer): Promise<IUser | IEmployer> {
        const userRepository = new UserRepository();

        // Validate the role (either 'user' or 'employer')
        if (!this.validateRole(userData.role)) {
            throw new Error('Invalid role. Must be "user" or "employer".');
        }

        // Check if the user already exists based on email and role
        const existingUser = await userRepository.findByEmail(userData.email, userData.role);
        if (existingUser) {
            throw new Error('User already exists!');
        }

        // Hash the password before saving to the database
        const hashedPassword = await hashPassword(userData.password || "");

        console.log("HASHEDPASSWORD", hashedPassword);

        // Depending on the role, choose the appropriate model
        let newUser;
        if (isEmployerRole(userData.role)) {
            // If the role is 'employer', use the Employer model
            newUser = new EmployerModel({
                ...userData,
                password: hashedPassword
            });
        } else {
            // If the role is 'user', use the User model
            newUser = new UserModel({
                ...userData,
                password: hashedPassword
            });
        }

        // Save the user in the appropriate model
        await newUser.save();
        return newUser;
    }

    // Login method remains the same as before
    async login(email: string, password: string, role: string): Promise<ILoginResponse> {
        const userRepository = new UserRepository();

        console.log("IN AUTHSERVICE LOGIN");
        const user = await userRepository.findByEmail(email, role);
        console.log("USER", user);

        if (!user) {
            throw new Error('Invalid user');
        }

        const isMatch = await comparePassword(password, user.password || "");
        console.log("ISMATCH", isMatch);

        if (!isMatch) {
            throw new Error('Invalid password');
        }

        const accessToken = generateToken({ userId: (user._id as string).toString(), role: user.role });
        const refreshToken = generateRefreshToken({ userId: (user._id as string).toString(), role: user.role });
        console.log(accessToken)
        console.log(refreshToken)
        console.log(user)
        return { accessToken, refreshToken, user };
    }
}

export default AuthService;
