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
const employerRepository_1 = require("./../repositories/employerRepository");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
let EmployerService = class EmployerService {
    constructor(employerRepository) {
        this.employerRepository = employerRepository;
    }
    async updateUser(userId, userData, logoPath) {
        try {
            if (logoPath) {
                userData.logo = logoPath;
            }
            const updatedUser = await this.employerRepository.updateUser(userId, userData);
            if (!updatedUser) {
                throw new Error('User not found');
            }
            return updatedUser;
        }
        catch (error) {
            throw new Error("Error occured while updatingEmployer");
        }
    }
    async isVerified(employerId) {
        return await this.employerRepository.isVerified(employerId);
    }
};
EmployerService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.EmployerRepository)),
    __metadata("design:paramtypes", [employerRepository_1.EmployerRepository])
], EmployerService);
exports.default = EmployerService;
