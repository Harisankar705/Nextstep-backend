"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployerRepository = void 0;
const mongoose_1 = require("mongoose");
const baseRepository_1 = require("./baseRepository");
const Employer_1 = __importDefault(require("../models/Employer"));
class EmployerRepository extends baseRepository_1.BaseRepository {
    constructor() {
        super(Employer_1.default);
    }
    async updateUser(userId, userData) {
        try {
            const objectId = new mongoose_1.Types.ObjectId(userId);
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
        }
        catch (error) {
            throw new Error("Error occurred while updating employer in repository");
        }
    }
    async isVerified(employerId) {
        const employer = await this.findById(employerId);
        return employer?.isVerified === 'VERIFIED';
    }
}
exports.EmployerRepository = EmployerRepository;
