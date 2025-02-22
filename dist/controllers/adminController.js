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
exports.AdminController = void 0;
const roleValidate_1 = require("../utils/roleValidate");
const adminService_1 = require("../services/adminService");
const statusCode_1 = require("../utils/statusCode");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
const adminDTO_1 = require("../dtos/adminDTO");
const validateDTO_1 = require("../dtos/validateDTO");
const authService_1 = require("../services/authService");
let AdminController = class AdminController {
    constructor(adminService, authService) {
        this.adminService = adminService;
        this.authService = authService;
    }
    async getUsers(req, res, next) {
        try {
            const { role } = req.params;
            const roleValidation = (0, roleValidate_1.validateRole)(role);
            if (!roleValidation.valid) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
                return;
            }
            const response = await this.authService.getCandidateService(role);
            res.status(statusCode_1.STATUS_CODES.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async individualDetails(req, res, next) {
        try {
            const { id } = req.params;
            const individualDetailsDTO = await (0, validateDTO_1.validateDTO)(adminDTO_1.IndividualDetailsDTO, req.body);
            const role = req.query.role;
            if (!id || typeof id !== 'string') {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Id not a string" });
                return;
            }
            const response = await this.adminService.getIndividualDetails(id, role);
            res.status(statusCode_1.STATUS_CODES.OK).json(response);
        }
        catch (error) {
            next(error);
        }
    }
    async toggleUser(req, res, next) {
        try {
            const toggleUserDTO = await (0, validateDTO_1.validateDTO)(adminDTO_1.ToggleUserDTO, req.body);
            const { id } = req.params;
            const roleValidation = (0, roleValidate_1.validateRole)(toggleUserDTO.role);
            if (!roleValidation.valid) {
                res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
                return;
            }
            const response = await this.adminService.toggleUser(id, toggleUserDTO.role);
            res.status(statusCode_1.STATUS_CODES.OK).json({ success: true, message: "User status toggled successfully", data: response });
        }
        catch (error) {
            next(error);
        }
    }
    async verificationStatus(req, res, next) {
        try {
            const id = req.params.id;
            const status = req.body.status;
            const verificationStatusDTO = await (0, validateDTO_1.validateDTO)(adminDTO_1.VerifyUserDTO, req.body);
            if (!id) {
                res.status(statusCode_1.STATUS_CODES.NOT_FOUND).json({ message: "id or status not provided" });
                return;
            }
            const response = await this.adminService.verifyUser(id, verificationStatusDTO.status);
            res.status(statusCode_1.STATUS_CODES.OK).json({ success: true, message: `Approval has been successfully ${verificationStatusDTO.status}` });
        }
        catch (error) {
            next(error);
        }
    }
    async adminLogout(req, res, next) {
        try {
            res.clearCookie('adminToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.AdminController = AdminController;
exports.AdminController = AdminController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.AdminService)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.AuthService)),
    __metadata("design:paramtypes", [adminService_1.AdminService, authService_1.AuthService])
], AdminController);
