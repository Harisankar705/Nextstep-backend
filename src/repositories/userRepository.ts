import { IJob, IPosts } from './../types/authTypes';
import { IAdmin, IEmployer, IUser } from '../types/authTypes';
import { Model, Document, Types } from 'mongoose'
import { postModel } from '../models/post';
import EmployerModel from "../models/Employer";
import UserModel from "../models/User";
import { getModel } from '../utils/modelUtil';
import { BaseRepository } from './baseRepository';
export class UserRepository extends BaseRepository<Document> {
    async findByEmail(email: string, role: string): Promise<IUser | IEmployer | IAdmin | null> {
        try {
            const model = getModel(role);
            if (role === 'employer') {
                return (model as Model<IEmployer & Document>).findOne({ email }).exec();
            }
            if (role === 'user') {
                return (model as Model<IUser & Document>).findOne({ email }).exec();
            }
            if (role === 'admin') {
                return (model as Model<IAdmin & Document>).findOne({ email }).exec()
            }
            throw new Error(`Invalid role: ${role}`);
        } catch (error) {
            throw new Error('Error occurred while finding by email');
        }
    }
    async search(query:string):Promise<{users:IUser[] ; posts:IPosts[]; employers:IEmployer[] }> {
        try
        {
            if(!query)
            {
                throw new Error("query not found")
            }
            const [users,posts,employers]=await Promise.all([
                UserModel.find({
                    $or:[
                        {firstName:{$regex:query,$options:'i'}},
                        {secondName:{$regex:query,$options:'i'}}
                    ]
                }).select('-password'),
                postModel.find({
                    $or:[
                        {location:{$regex:query,$options:'i'}},
                        {text:{$regex:query,$options:'i'}}
                    ]
                }),
                EmployerModel.find({
                    $or:[
                        {companyName:{$regex:query,$options:'i'}},
                    ]
                })
            ])
            return {users,posts,employers}
        }
        catch(error)
        {
            throw error
        }
    }   
    async findUserPosts(userId:string)
    {
        try {
            const posts = await postModel.find({ userId }).sort({ createdAt: -1 })
                .lean()
                .populate('likes')
                .populate('comments')
                return posts
        } catch (error) {
            throw new Error("Error occured in findUserPosts")
        }
    }
    async findById(userId: string, role: string): Promise<IUser | IEmployer  | null> {
        try {
            const model = getModel(role);
            if (role === 'employer') {
                return (model as Model<IEmployer & Document>).findById(userId ).exec();
            }
            if (role === 'user') {
                return (model as Model<IUser & Document>).findById( userId ).exec();
            }
            
            throw new Error(`Invalid role: ${role}`);
        } catch (error) {
            throw new Error('Error occurred while finding by email');
        }
    }
    async createUser(userData: Partial<IUser | IEmployer>, role: string): Promise<IUser | IEmployer> {
        try {
            const model = getModel(role)
            if (role === 'employer') {
                const employer = new (model as Model<IEmployer & Document>)(userData)
                return await employer.save()
            }
            if (role === 'user') {
                const user = new (model as Model<IUser & Document>)(userData)
                return await user.save()
            }
            throw new Error(`Invalid role: ${role}`);
        } catch (error) {
            throw new Error("error occured while creating candidate")
        }
    }
    async createPost (postData:object,role:string,userId:string):Promise<Document>{
        try {
            const model=getModel(role)as Model<IUser |IEmployer>
            const user=await model.findById(userId)
            if(!user)
            {
                throw new Error("user not found in createpost")
            }
            const newPost={...postData,userId:userId,createdAt:new Date(),userType:role==='employer'?'employer':'user'}
            const savedPost=await postModel.create(newPost)
            if(savedPost)
            {
            }
            return savedPost
        } catch (error) {
            throw new Error("Error creating post")
        }
    }
    async updateUser(userId: string, userData: Partial<IUser>): Promise<IUser | null> {
        try {
            const objectId = new Types.ObjectId(userId);
            const user = await UserModel.findById(objectId);
            if (!user) {
                throw new Error("User not found");
            }
            const updatePayLoad: Partial<IUser> = {
                ...user.toObject(),
                ...userData,
            };
            updatePayLoad.isProfileComplete =
                !!(updatePayLoad.profilePicture &&
                    updatePayLoad.resume &&
                    updatePayLoad.experience &&
                    updatePayLoad.skills?.length &&
                    updatePayLoad.education?.length);
            const updatedUser = await UserModel.findByIdAndUpdate(objectId, { $set: { ...updatePayLoad, isProfileComplete: true } }, { new: true });
            return updatedUser;
        } catch (error) {
            throw new Error("Error occurred while updating user");
        }
    }
}