import { IAdmin, IEmployer, IUser } from '../types/authTypes';
import EmployerModel from '../models/employer'
import UserModel from '../models/user'
import { Model, Document, Types } from 'mongoose'
import AdminModel from '../models/admin';
import { Post } from '../models/post';
export class UserRepository {
    private getModel(role: string): Model<IUser & Document> | Model<IEmployer & Document> |Model<IAdmin & Document> {
        if (role === 'employer') {
            return EmployerModel as Model<IEmployer & Document>
        }
        if (role === 'user') {
            return UserModel as Model<IUser & Document>
        }
        if (role === 'admin') {
            return AdminModel as Model<IAdmin & Document>
        }
        throw new Error(`invalid role${role}`)

    }
    private getPostModel(role: string): Model<IUser & Document> | Model<IEmployer & Document> {
        if (role === 'employer') {
            return EmployerModel as Model<IEmployer & Document>
        }
        if (role === 'user') {
            return UserModel as Model<IUser & Document>
        }
       
        throw new Error(`invalid role${role}`)

    }

    async findByEmail(email: string, role: string): Promise<IUser | IEmployer | IAdmin | null> {
        try {
            const model = this.getModel(role);
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
            console.error("Error finding user by email:", error);
            throw new Error('Error occurred while finding by email');
        }
    }
    async findById(userId: string, role: string): Promise<IUser | IEmployer | IAdmin | null> {
        try {
            const model = this.getModel(role);
            if (role === 'employer') {
                return (model as Model<IEmployer & Document>).findOne({ userId }).exec();
            }
            if (role === 'user') {
                return (model as Model<IUser & Document>).findOne({ userId }).exec();
            }
            
            throw new Error(`Invalid role: ${role}`);
        } catch (error) {
            console.error("Error finding user by email:", error);
            throw new Error('Error occurred while finding by email');
        }
    }
    
   

    async createUser(userData: Partial<IUser | IEmployer>, role: string): Promise<IUser | IEmployer> {
        try {
            const model = this.getModel(role)
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
            console.log('in createpost',postData)
            console.log('in createpostrole',role)
            console.log('in createpostrole',userId)
            const model=this.getModel(role)as Model<IUser |IEmployer>
            const user=await model.findById(userId)
            if(!user)
            {
                throw new Error("user not found in createpost")
            }
            const newPost={...postData,userId:userId,createdAt:new Date(),userType:role==='employer'?'employer':'user'}
            const postModel=Post 
            const savedPost=await postModel.create(newPost)
            if(savedPost)
            {
                console.log("post saved")
            }
            
            return savedPost
        } catch (error) {
            console.error(error)
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