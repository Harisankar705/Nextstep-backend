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
exports.AuthMiddleware = void 0;
const userRepository_1 = require("./../repositories/userRepository");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const statusCode_1 = require("../utils/statusCode");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
let AuthMiddleware = class AuthMiddleware {
    constructor(userRespository) {
        this.userRespository = userRespository;
        this.verifyToken = async (req, res, next) => {
            const employerToken = req.cookies.employerAccessToken;
            const candidateToken = req.cookies.userAccessToken;
            const adminToken = req.cookies.adminAccessToken;
            const token = employerToken || candidateToken || adminToken;
            if (!token) {
                res.status(statusCode_1.STATUS_CODES.FORBIDDEN).json({ message: "Token not found" });
                return;
            }
            let role;
            if (employerToken) {
                role = "employer";
            }
            else if (candidateToken) {
                role = "user";
            }
            else if (adminToken) {
                role = "admin";
            }
            else {
                res.status(statusCode_1.STATUS_CODES.FORBIDDEN).json({ message: "Role not recognized" });
                return;
            }
            try {
                const decoded = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN);
                req.user = decoded;
                const userData = await this.userRespository.findUserById(decoded.userId, role);
                if (!userData || userData.status === 'Inactive') {
                    const cookieName = employerToken ? "employerAccessToken" : candidateToken ? "userAccessToken" : "adminAccessToken";
                    res.clearCookie(cookieName);
                    res.status(statusCode_1.STATUS_CODES.NOT_FOUND).json({ message: "Authentication restricted!" });
                    return;
                }
                next();
            }
            catch (error) {
                next(error);
            }
        };
    }
};
exports.AuthMiddleware = AuthMiddleware;
exports.AuthMiddleware = AuthMiddleware = __decorate([
    __param(0, (0, inversify_1.inject)(types_1.TYPES.UserRepository)),
    __metadata("design:paramtypes", [userRepository_1.UserRepository])
], AuthMiddleware);
