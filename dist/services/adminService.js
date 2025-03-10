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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const inversify_1 = require("inversify");
const Employer_1 = __importDefault(require("../models/Employer"));
const User_1 = __importDefault(require("../models/User"));
const adminRepository_1 = require("./../repositories/adminRepository");
const types_1 = require("../types/types");
let AdminService = class AdminService {
    constructor(adminRepository) {
        this.adminRepository = adminRepository;
    }
    async toggleUser(id, role) {
        try {
            if (role !== 'user' && role !== 'employer') {
                throw new Error('invalid role provided');
            }
            const model = (role === 'user' ? User_1.default : Employer_1.default);
            const updatedUser = await this.adminRepository.changeUserStatus(model, id);
            return updatedUser;
        }
        catch (error) {
            throw new Error("Error occured toggleUser");
        }
    }
    async getIndividualDetails(id, role) {
        return this.adminRepository.getIndividualDetails(id, role);
    }
    async verifyUser(id, status) {
        if (!id || !status) {
            throw new Error("invalid role or status provided");
        }
        return this.adminRepository.updateVerificationStatus(id, status);
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.AdminRepository)),
    __metadata("design:paramtypes", [adminRepository_1.AdminRepository])
], AdminService);
