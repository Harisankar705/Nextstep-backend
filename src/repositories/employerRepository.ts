import { IEmployer } from "../types/authTypes";
import { Types } from 'mongoose';
import { BaseRepository } from "./baseRepository"; 
import EmployerModel from "../models/Employer";
import { IEmployerRepository } from "../types/repositoryInterface";
export class EmployerRepository extends BaseRepository<IEmployer> implements IEmployerRepository {
    constructor() {
        super(EmployerModel); 
    }
    async updateUser(userId: string, userData: Partial<IEmployer>): Promise<IEmployer | null> {
        try {
            const objectId = new Types.ObjectId(userId);
            const user = await this.findOne({ _id: objectId });
            if (!user) {
                throw new Error("Employer not found");
            }
            const updatedUser = await this.update(userId, { 
                ...userData, 
                isProfileComplete: true 
            });
            if (!updatedUser) {
                throw new Error("Failed to update employer");
            }
            return updatedUser;
        } catch (error) {
            throw new Error("Error occurred while updating employer in repository");
        }
    }
    async isVerified(employerId: string): Promise<boolean> {
        const employer = await this.findById(employerId);
        return employer?.isVerified === 'APPROVED'; 
    }
}
