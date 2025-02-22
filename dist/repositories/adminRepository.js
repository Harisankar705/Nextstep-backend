"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRepository = void 0;
const mongoose_1 = require("mongoose");
const baseRepository_1 = require("./baseRepository");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
const modelUtil_1 = require("../utils/modelUtil");
let AdminRepository = class AdminRepository extends baseRepository_1.BaseRepository {
    constructor(userModel, employerModel) {
        super(userModel);
        this.userModel = userModel;
        this.employerModel = employerModel;
    }
    async changeUserStatus(model, id) {
        const user = await model.findById(id).lean();
        if (!user) {
            throw new Error("User not found");
        }
        if (!("status" in user)) {
            throw new Error("User does not have a status field");
        }
        const newStatus = user.status === "Active" ? "Inactive" : "Active";
        const updatedUser = await model.findByIdAndUpdate(id, { $set: { status: newStatus } }, { new: true, runValidators: true }).lean();
        if (!updatedUser) {
            throw new Error("Failed to update user status");
        }
        return updatedUser;
    }
    async updateVerificationStatus(id, status) {
        try {
            const employer = await this.employerModel.findById(id);
            const updatedEmployer = await this.employerModel.findByIdAndUpdate(id, { $set: { isVerified: status } }, { new: true });
            return updatedEmployer;
        }
        catch (error) {
            throw error;
        }
    }
    async getIndividualDetails(id, role) {
        let details = [];
        const userModel = await (0, modelUtil_1.getModel)(role);
        if (!userModel) {
            throw new Error("Invalid role");
        }
        let userDetails = await userModel.findById(id).populate("jobs");
        if (userDetails) {
            details.push(userDetails);
        }
        return details;
    }
};
exports.AdminRepository = AdminRepository;
exports.AdminRepository = AdminRepository = __decorate([
    __param(0, (0, inversify_1.inject)(types_1.TYPES.UserModel)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.EmployerModel)),
    __metadata("design:paramtypes", [mongoose_1.Model, mongoose_1.Model])
], AdminRepository);
