import {  IPosts,IAdmin, IEmployer, IUser } from './../types/authTypes';
import { Model, Document, Types } from 'mongoose'
import { getModel } from '../utils/modelUtil';
import { BaseRepository } from './baseRepository';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types/types';
@injectable()
export class UserRepository extends BaseRepository<IUser> {
    constructor(@inject(TYPES.UserModel)private userModel:Model<IUser & Document>,@inject(TYPES.EmployerModel)private employerModel:Model<IEmployer & Document>,@inject(TYPES.PostModel)private postModel:Model<IPosts& Document>){
        super(userModel)
    }
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
                this.userModel.find({
                    $or:[
                        {firstName:{$regex:query,$options:'i'}},
                        {secondName:{$regex:query,$options:'i'}}
                    ]
                }).select('-password'),
                this.postModel.find({
                    $or:[
                        {location:{$regex:query,$options:'i'}},
                        {text:{$regex:query,$options:'i'}}
                    ]
                }),
                this.employerModel.find({
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
            const posts = await this.postModel.find({ userId }).sort({ createdAt: -1 })
                .lean()
                .populate('likes')
                .populate('comments')
                return posts
        } catch (error) {
            throw new Error("Error occured in findUserPosts")
        }
    }
    async findUserById(userId: string, role: string): Promise<IUser | IEmployer  | IAdmin|null> {
        try {
            const model = getModel(role);
            console.log("MODEL",model)
            if (role === 'employer') {
                return (model as Model<IEmployer & Document>).findById(userId ).exec();
            }
            if (role === 'user') {
                return (model as Model<IUser & Document>).findById( userId ).exec();
            }
            if (role === 'admin') {
                return (model as Model<IAdmin & Document>).findById( userId ).exec();
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
            const savedPost=await this.postModel.create(newPost)
            if(savedPost)
            {
            }
            return savedPost
        } catch (error) {
            throw new Error("Error creating post")
        }
    }   
    async editPost (postId:string,updatePostData:object,role:string,userId:string):Promise<Document|null>{
        try {
            const model=getModel(role)as Model<IUser |IEmployer>
            const user=await model.findById(userId)
            if(!user)
            {
                throw new Error("user not found in createpost")
            }
            const post=await this.postModel.findById(postId)
            if(!post)
            {
                throw new Error("Post not found!")
            }
            const updatedPost={...updatePostData,updatedAt:new Date()}
            const savedPost=await this.postModel.findByIdAndUpdate(postId,updatePostData,{new:true})
            return savedPost
        } catch (error) {
            throw new Error("Error updating post")
        }
    }   
    async updateUser(userId: string, userData: Partial<IUser>): Promise<IUser | null> {
        try {
            const objectId = new Types.ObjectId(userId);
            const user = await this.userModel.findById(objectId);
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
            const updatedUser = await this.userModel.findByIdAndUpdate(objectId, { $set: { ...updatePayLoad, isProfileComplete: true } }, { new: true });
            return updatedUser;
        } catch (error) {
            throw new Error("Error occurred while updating user");
        }
    }
}