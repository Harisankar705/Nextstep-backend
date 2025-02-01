import { UserRepository } from './../repositories/userRepository';
import { IEmployer, ILoginResponse, IUser } from './../types/authTypes';
import { comparePassword, hashPassword } from '../utils/hashPassword'
import { generateRefreshToken, generateToken } from '../utils/jwtUtils'
import UserModel from '../models/User'
import EmployerModel from '../models/Employer'
import otpService from './otpService'
import { IAuthService } from '../types/serviceInterface';
function isEmployerRole(role: string): role is 'employer' {
    return role === 'employer';
}
const userRepository = new UserRepository()
class AuthService implements IAuthService {
    private OtpInstance = new otpService()
    private validateRole(role: string): boolean {
        return ['user', 'employer'].includes(role);
    }
    async createPostService(userId: string, postData: object, role: string) {
        const userRepository = new UserRepository()
        const response = await userRepository.createPost(postData, role,userId)
        return response
    }
    async searchService(query:string)
    {
        try {
            if(!query.trim())
            {
                throw new Error("Query not given for search")
            }
            const results=await userRepository.search(query)
            return results
        } catch (error) {
        }
    }
    async register(userData: IUser | IEmployer): Promise<IUser | IEmployer> {
        try {
            const userRepository = new UserRepository();
            if (!this.validateRole(userData.role)) {
                throw new Error('Invalid role. Must be "user" or "employer".');
            }
            const existingUser = await userRepository.findByEmail(userData.email, userData.role);
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
    async getUsersPosts(userId:string){
        try
        {
            const posts = await userRepository.findUserPosts(userId)
            return posts
        }
        catch(error)
        {
            throw error
        }
    }
    async login(email: string, password: string, role: string): Promise<ILoginResponse> {
        try {
            const userRepository = new UserRepository();
            const user = await userRepository.findByEmail(email, role);
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
            catch (error:any) {
                throw error
        }
    }
    async updateUser(userId: string, userData: Partial<IUser>, profilePicturePath?: string, resume?: string): Promise<IUser | null> {
        const userRepository = new UserRepository();
        try {
            if (profilePicturePath) {
                userData.profilePicture = profilePicturePath;
            }
            if (resume) {
                userData.resume = [resume]
            }
            const updatedUser = await userRepository.updateUser(userId, userData);
            if (!updatedUser) {
                throw new Error("User  not found");
            }
            return updatedUser;
        } catch (error) {
            throw new Error(`Error occurred while updating user:`);
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
export default AuthService;
