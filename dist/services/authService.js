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
exports.AuthService = void 0;
const inversify_1 = require("inversify");
const userRepository_1 = require("./../repositories/userRepository");
const hashPassword_1 = require("../utils/hashPassword");
const jwtUtils_1 = require("../utils/jwtUtils");
const User_1 = __importDefault(require("../models/User"));
const Employer_1 = __importDefault(require("../models/Employer"));
const otpService_1 = __importDefault(require("./otpService"));
const inversify_2 = require("inversify");
const types_1 = require("../types/types");
function isEmployerRole(role) {
    return role === 'employer';
}
let AuthService = class AuthService {
    constructor(userRepository, transporter, OtpInstance) {
        this.userRepository = userRepository;
        this.transporter = transporter;
        this.OtpInstance = OtpInstance;
    }
    validateRole(role) {
        return ['user', 'employer'].includes(role);
    }
    async createPostService(userId, postData, role) {
        const response = await this.userRepository.createPost(postData, role, userId);
        return response;
    }
    async editPostService(postId, updatedData, role, userId) {
        const response = await this.userRepository.editPost(postId, updatedData, role, userId);
        return response;
    }
    async searchService(query) {
        try {
            if (!query.trim()) {
                throw new Error("Query not given for search");
            }
            const results = await this.userRepository.search(query);
            return results;
        }
        catch (error) {
            throw new Error("Error occured during searching");
        }
    }
    async register(userData) {
        try {
            if (!this.validateRole(userData.role)) {
                throw new Error('Invalid role. Must be "user" or "employer".');
            }
            const existingUser = await this.userRepository.findByEmail(userData.email, userData.role);
            if (existingUser) {
                throw new Error('User already exists!');
            }
            const hashedPassword = await (0, hashPassword_1.hashPassword)(userData.password || "");
            let newUser;
            if (isEmployerRole(userData.role)) {
                newUser = new Employer_1.default({
                    ...userData,
                    password: hashedPassword
                });
            }
            else {
                newUser = new User_1.default({
                    ...userData,
                    password: hashedPassword
                });
            }
            await newUser.save();
            return newUser;
        }
        catch (error) {
            throw error;
        }
    }
    async getUsersPosts(userId) {
        try {
            const posts = await this.userRepository.findUserPosts(userId);
            return posts;
        }
        catch (error) {
            throw error;
        }
    }
    async login(email, password, role) {
        try {
            const user = await this.userRepository.findByEmail(email, role);
            if (!user) {
                throw new Error('User not found! Try Signup!');
            }
            const isMatch = await (0, hashPassword_1.comparePassword)(password, user.password || "");
            if (!isMatch) {
                throw new Error("invalid email or password");
            }
            const accessToken = (0, jwtUtils_1.generateToken)({ userId: user._id.toString(), role: user.role });
            const refreshToken = (0, jwtUtils_1.generateRefreshToken)({ userId: user._id.toString(), role: user.role });
            const isProfileComplete = user.isProfileComplete || false;
            return { accessToken, refreshToken, user, isProfileComplete };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error login: ${error.message}`);
            }
            else {
                throw new Error(`Error login`);
            }
        }
    }
    async updateUser(userId, userData, profilePicturePath, resume) {
        try {
            if (profilePicturePath) {
                userData.profilePicture = profilePicturePath;
            }
            if (resume) {
                userData.resume = [resume];
            }
            const updatedUser = await this.userRepository.updateUser(userId, userData);
            if (!updatedUser) {
                throw new Error("User  not found");
            }
            return updatedUser;
        }
        catch (error) {
            throw new Error(`Error occurred while updating user:`);
        }
    }
    async getCandidateService(role) {
        try {
            if (role !== 'user' && role !== 'employer') {
                throw new Error("invalid role provided");
            }
            let candidates = [];
            if (role === 'user') {
                candidates = await User_1.default.find();
            }
            if (role === 'employer') {
                candidates = await Employer_1.default.find();
            }
            return candidates;
        }
        catch (error) {
            throw new Error(`Error occurred getcandidateservice`);
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, inversify_2.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.UserRepository)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.Transporter)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.OtpService)),
    __metadata("design:paramtypes", [userRepository_1.UserRepository, Object, otpService_1.default])
], AuthService);
