import { UserRepository } from './../repositories/userRepository';
import { EmployerRepository } from './../repositories/employerRepository';
import { IEmployer, ILoginResponse, IUser } from './../types/authTypes';
import { comparePassword, hashPassword } from '../utils/hashPassword'
import { generateRefreshToken, generateToken } from '../utils/jwtUtils'
import UserModel from '../models/user'
import EmployerModel from '../models/employer'
import otpService from './otpService'

function isEmployerRole(role: string): role is 'employer' {
    return role === 'employer';
}
const userRepository = new UserRepository()

class AuthService {
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
        console.log("Registering user with data:", JSON.stringify(userData, null, 2));

        try {
            const userRepository = new UserRepository();
            console.log('User Repository initialized');

            console.log('Validating role:', userData.role);
            if (!this.validateRole(userData.role)) {
                console.error('Invalid role detected:', userData.role);
                throw new Error('Invalid role. Must be "user" or "employer".');
            }

            console.log('Checking for existing user with email:', userData.email);
            const existingUser = await userRepository.findByEmail(userData.email, userData.role);

            if (existingUser) {
                console.warn('User already exists:', existingUser);
                throw new Error('User already exists!');
            }

            console.log('Hashing password');
            const hashedPassword = await hashPassword(userData.password || "");
            console.log('Password hashed successfully');

            let newUser;
            console.log('Determining user type based on role:', userData.role);

            if (isEmployerRole(userData.role)) {
                console.log('Creating Employer Model');
                newUser = new EmployerModel({
                    ...userData,
                    password: hashedPassword
                });
            } else {
                console.log('Creating User Model');
                newUser = new UserModel({
                    ...userData,
                    password: hashedPassword
                });
            }

            console.log('Attempting to save user');
            await newUser.save();
            console.log('User saved successfully:', newUser._id);

            return newUser;
        } catch (error) {
            console.error('Registration Error:', error);
            throw error;
        }
    }
    async getUsersPosts(userId:string){
        try
        {
            const posts = await userRepository.findUserPosts(userId)
            console.log("POSTS",posts)
            return posts
        }
        catch(error)
        {
            console.error("Error occured in getUserposts",error)
            throw error
        }
    }

    async login(email: string, password: string, role: string): Promise<ILoginResponse> {
        try {
            const userRepository = new UserRepository();
            console.log(email)
            console.log(password)
            console.log(role)
            const user = await userRepository.findByEmail(email, role);
            console.log(user)

            if (!user) {
                throw new Error('Invalid user');
            }
            if (user.status === 'Inactive') {
                throw new Error("Account is temporarily blocked!")
            }

            const isMatch = await comparePassword(password, user.password || "");
            console.log(isMatch)
            if (!isMatch) {
                throw new Error("invalid email or password")
            }

            const accessToken: string = generateToken({ userId: (user._id as string).toString(), role: user.role });
            const refreshToken: string = generateRefreshToken({ userId: (user._id as string).toString(), role: user.role });
            const isProfileComplete: boolean = user.isProfileComplete || false

            return { accessToken, refreshToken, user, isProfileComplete };
        } 
            catch (error:any) {
                throw new Error(error);
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
            console.error('Error occurred while updating user:', error);
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
            console.error('Error occurred in getcandidateservice:', error);
            throw new Error(`Error occurred getcandidateservice`);
        }
    }



}

export default AuthService;
