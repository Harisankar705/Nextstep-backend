import EmployerModel from '../models/Employer'
import UserModel from '../models/User'
import { IEmployer, IUser } from '../types/authTypes'
import { Model, Document ,Types} from 'mongoose'
export class UserRepository {
    private getModel(role: string): Model<IUser & Document> | Model<IEmployer & Document> {
        if (role === 'employer') {
            return EmployerModel as Model<IEmployer & Document>
        }
        if (role === 'user') {
            return UserModel as Model<IUser & Document>
        }
        throw new Error(`invalid role${role}`)

    }
    async findByEmail(email: string, role: string): Promise<IUser | IEmployer | null> {
        try {
            const model = this.getModel(role);
            console.log(model)
            if (role === 'employer') {
                return (model as Model<IEmployer & Document>).findOne({ email }).exec();
            }
            if (role === 'user') {
                console.log("IN USERMODEL")
                return (model as Model<IUser & Document>).findOne({ email }).exec();
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
                const user = new (model as Model<IEmployer & Document>)(userData)
                return await user.save()
            }
            throw new Error(`Invalid role: ${role}`);
        } catch (error) {
            console.log("ERROR ", error)
            throw new Error("error occured while creating candidate")
        }

    }
    async updateUser(userId: string, userData: Partial<IUser>): Promise<IUser | null> {
        try {
            const objectId = new Types.ObjectId(userId);
            console.log("Querying with ObjectId:", objectId);
    
            const user = await UserModel.findById(objectId);
            if (!user) {
                console.log("User not found");
                throw new Error("User not found");
            }
    
            console.log("USER found:", user);
    
            // Merge existing user data with the new data
            const updatePayLoad: Partial<IUser> = {
                ...user.toObject(), 
                ...userData,
            };
    
            console.log("Update Payload before checking isProfileComplete:", updatePayLoad);
    
            updatePayLoad.isProfileComplete =
                !!(updatePayLoad.profilePicture &&
                   updatePayLoad.resume &&
                   updatePayLoad.experience &&
                   updatePayLoad.skills?.length &&
                   updatePayLoad.education?.length);
    
            console.log("isProfileComplete after check:", updatePayLoad.isProfileComplete);
    
            // Update the user
            const updatedUser = await UserModel.findByIdAndUpdate(objectId,{$set:{...updatePayLoad,isProfileComplete:true}},{new:true});
    
            console.log("Updated User:", updatedUser);
    
            return updatedUser;
        } catch (error) {
            console.log("ERROR: ", error);
            throw new Error("Error occurred while updating user");
        }
    }
    
    
    
    
    

}