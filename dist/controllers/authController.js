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
exports.AuthController = void 0;
const userDTO_1 = require("./../dtos/userDTO");
const otpService_1 = __importDefault(require("../services/otpService"));
const User_1 = __importDefault(require("../models/User"));
const jwtUtils_1 = require("../utils/jwtUtils");
const formidable_1 = require("../utils/formidable");
const roleValidate_1 = require("../utils/roleValidate");
const statusCode_1 = require("../utils/statusCode");
const inversify_1 = require("inversify");
const adminDTO_1 = require("../dtos/adminDTO");
const validateDTO_1 = require("../dtos/validateDTO");
const types_1 = require("../types/types");
let AuthController = class AuthController {
    constructor(authService, otpServiceInstance) {
        this.authService = authService;
        this.otpServiceInstance = otpServiceInstance;
        this.signup = async (req, res, next) => {
            try {
                const signupData = await (0, validateDTO_1.validateDTO)(userDTO_1.SignupDTO, req.body);
                const roleValidation = (0, roleValidate_1.validateRole)(signupData.role);
                if (!roleValidation.valid) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
                    return;
                }
                const user = await this.authService.register(signupData);
                res.status(statusCode_1.STATUS_CODES.CREATED).json(user);
            }
            catch (error) {
                next(error);
            }
        };
        this.candidateDetails = async (req, res, next) => {
            try {
                const uploadResponse = await (0, formidable_1.handleFileUpload)(req);
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(statusCode_1.STATUS_CODES.CREATED).json({ message: "Authentication required" });
                    return;
                }
                const { profilePicture, resumeFile } = uploadResponse.fileNames;
                const userData = uploadResponse.fields || {};
                if (!userData.data) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "No data provided for update" });
                    return;
                }
                let parsedData;
                try {
                    parsedData = JSON.parse(userData.data);
                }
                catch (error) {
                    return next(error);
                }
                const user = await User_1.default.findById(userId);
                if (!user) {
                    res.status(statusCode_1.STATUS_CODES.NOT_FOUND).json({ message: "User not found" });
                    return;
                }
                const userResume = user.resume || [];
                const newResume = uploadResponse.fileNames?.resumeFile || [];
                const mergedResume = Array.isArray(userResume) ? userResume : [userResume];
                const newResumeArray = Array.isArray(newResume) ? newResume : [newResume];
                const mergedResumes = [...new Set([...mergedResume, ...newResumeArray])].filter(Boolean);
                const updatePayload = {
                    profilePicture,
                    resume: mergedResumes,
                    experience: parsedData.experience,
                    languages: parsedData.languages,
                    location: parsedData.location,
                    aboutMe: parsedData.aboutMe,
                    education: parsedData.education,
                    dateOfBirth: parsedData.dateofbirth,
                    gender: parsedData.gender,
                    skills: parsedData.skills,
                };
                const updatedUser = await this.authService.updateUser(userId, updatePayload);
                res.status(statusCode_1.STATUS_CODES.OK).json({
                    message: "User updated successfully!",
                    updatedUser,
                    profilePicture,
                });
                return;
            }
            catch (error) {
                return next(error);
            }
        };
        this.search = async (req, res, next) => {
            try {
                const searchDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.SearchDTO, req.body);
                const result = await this.authService.searchService(searchDTO.query);
                res.json({ success: true, data: result });
            }
            catch (error) {
                next(error);
            }
        };
        this.createPost = async (req, res, next) => {
            try {
                console.log('in createpost');
                const uploadResponse = await (0, formidable_1.handleFileUpload)(req);
                const { text, background, role, postImage } = uploadResponse.fields || {};
                if (!text?.[0] || !role?.[0]) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({
                        message: "Missing required fields",
                        received: { text: text?.[0], role: role?.[0] },
                    });
                    return;
                }
                const roleValidation = (0, roleValidate_1.validateRole)(role[0]);
                if (!roleValidation.valid) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Role not valid" });
                    return;
                }
                const userId = req.user?.userId;
                const postData = {
                    text: text[0],
                    background: background?.[0] || "",
                    image: uploadResponse.fileNames?.postImage || [],
                    files: uploadResponse.fileNames || {},
                };
                const response = await this.authService.createPostService(userId, postData, role[0]);
                res.status(statusCode_1.STATUS_CODES.CREATED).json(response);
            }
            catch (error) {
                console.log(error);
                next(error);
            }
        };
        this.editPost = async (req, res, next) => {
            try {
                const { postId } = req.params;
                if (!postId) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Post ID is required" });
                    return;
                }
                const uploadResponse = await (0, formidable_1.handleFileUpload)(req);
                console.log("uploadresponse", uploadResponse);
                const { text, background, role } = uploadResponse.fields || {};
                if (!text?.[0] || !role?.[0]) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({
                        message: "Missing required fields",
                        received: { text: text?.[0], role: role?.[0] },
                    });
                    return;
                }
                const roleValidation = (0, roleValidate_1.validateRole)(role[0]);
                if (!roleValidation.valid) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Invalid role" });
                    return;
                }
                const updatedData = {};
                if (text)
                    updatedData.text = text[0];
                if (background)
                    updatedData.background = background[0];
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "User not authenticated" });
                    return;
                }
                const response = await this.authService.editPostService(postId, updatedData, role[0], userId);
                res.status(statusCode_1.STATUS_CODES.OK).json(response);
            }
            catch (error) {
                console.error(error);
                next(error);
            }
        };
        this.login = async (req, res, next) => {
            try {
                const loginData = await (0, validateDTO_1.validateDTO)(adminDTO_1.LoginDTO, req.body);
                if (!loginData.email || !loginData.password || !loginData.role) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Data not present!" });
                    return;
                }
                const roleValidation = (0, roleValidate_1.validateRole)(loginData.role);
                if (!roleValidation.valid) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
                    return;
                }
                const { accessToken, refreshToken, user } = await this.authService.login(loginData.email, loginData.password, loginData.role);
                if (user.status === "Inactive") {
                    res.status(statusCode_1.STATUS_CODES.FORBIDDEN).json({ message: "Your account is currently blocked" });
                    return;
                }
                const tokenPrefix = loginData.role.toLowerCase();
                res.cookie(`${tokenPrefix}AccessToken`, accessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 40 * 60 * 1000,
                });
                res.cookie(`${tokenPrefix}RefreshToken`, refreshToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                    maxAge: 7 * 24 * 60 * 60 * 1000,
                });
                res.status(statusCode_1.STATUS_CODES.CREATED).json({ user });
            }
            catch (error) {
                next(error);
            }
        };
        this.sendOTPcontroller = async (req, res, next) => {
            try {
                const sendOTPDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.SendOTPDTO, req.body);
                const roleValidation = (0, roleValidate_1.validateRole)(sendOTPDTO.role);
                if (!roleValidation.valid) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
                    return;
                }
                await this.otpServiceInstance.sendOTP(sendOTPDTO.email, sendOTPDTO.role);
                res.status(statusCode_1.STATUS_CODES.CREATED).send({ message: "OTP sent" });
            }
            catch (error) {
                next(error);
            }
        };
        this.resendOTPcontroller = async (req, res, next) => {
            try {
                const resendOTPDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.VerifyOTPDTO, req.body);
                const roleValidation = (0, roleValidate_1.validateRole)(resendOTPDTO.role);
                if (!roleValidation.valid) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
                    return;
                }
                await this.otpServiceInstance.resendOTP(resendOTPDTO.email, resendOTPDTO.role);
                res.status(statusCode_1.STATUS_CODES.OK).send({ message: "OTP resent" });
            }
            catch (error) {
                next(error);
            }
        };
        this.verifyOTPController = async (req, res, next) => {
            try {
                const verifyOTPDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.VerifyOTPDTO, req.body);
                const roleValidation = (0, roleValidate_1.validateRole)(verifyOTPDTO.role);
                if (!roleValidation.valid) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
                    return;
                }
                const isVerified = await this.otpServiceInstance.verifyOtp(verifyOTPDTO.email, verifyOTPDTO.otp, verifyOTPDTO.role);
                if (isVerified) {
                    res.status(statusCode_1.STATUS_CODES.OK).json({ message: "OTP verification successful!" });
                }
                else {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Failed to verify OTP" });
                }
            }
            catch (error) {
                next(error);
            }
        };
        this.emailOrPhoneNumber = async (req, res, next) => {
            try {
                const emailOrPhoneNumberDTO = await (0, validateDTO_1.validateDTO)(userDTO_1.EmailOrPhoneDTO, req.body);
                const { email, phoneNumber } = emailOrPhoneNumberDTO;
                const userByEmail = await User_1.default.findOne({ email });
                if (userByEmail) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ isTaken: true, message: "Email already exists" });
                    return;
                }
                const userByPhoneNumber = await User_1.default.findOne({ phoneNumber });
                if (userByPhoneNumber) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ isTaken: true, message: "Phone number already exists" });
                    return;
                }
                res.json({ isTaken: false });
            }
            catch (error) {
                next(error);
            }
        };
        this.refreshTokenController = async (req, res, next) => {
            try {
                const tokenPrefix = req.body.role.toLowerCase();
                const refreshToken = req.cookies[`${tokenPrefix}RefreshToken`];
                if (!refreshToken) {
                    res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).send({ message: "Refresh token is missing" });
                    return;
                }
                const decoded = (0, jwtUtils_1.verifyToken)(refreshToken, "refresh");
                if (!decoded) {
                    res.status(statusCode_1.STATUS_CODES.FORBIDDEN).send({ message: "Failed to decode" });
                    return;
                }
                const { userId, role } = decoded;
                const newAccessToken = (0, jwtUtils_1.generateToken)({ userId, role });
                const newRefreshToken = (0, jwtUtils_1.generateRefreshToken)({ userId, role });
                this.setRefreshToken(res, newRefreshToken);
                res.status(statusCode_1.STATUS_CODES.OK).json({ accessToken: newAccessToken });
            }
            catch (error) {
                next(error);
            }
        };
        this.getUserPost = async (req, res, next) => {
            try {
                const authenticatedUserId = req.user?.userId;
                const targetUserId = req.query.userId;
                if (!authenticatedUserId) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Authorization required" });
                    return;
                }
                const userIdToFetch = targetUserId ? targetUserId : authenticatedUserId;
                const posts = await this.authService.getUsersPosts(userIdToFetch);
                const postsWithLikeStatus = posts.map((post) => {
                    const likedByUser = post.likes.some((like) => {
                        const likeUserId = like.userId ? like.userId.toString() : like.toString();
                        const authUserId = authenticatedUserId ? authenticatedUserId.toString() : String(authenticatedUserId);
                        return likeUserId === authUserId;
                    });
                    return { ...post, likedByUser };
                });
                res.status(statusCode_1.STATUS_CODES.OK).json(postsWithLikeStatus);
            }
            catch (error) {
                next(error);
            }
        };
    }
    setRefreshToken(res, refreshToken) {
        res.cookie("refresh-token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.AuthService)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.OtpService)),
    __metadata("design:paramtypes", [Object, otpService_1.default])
], AuthController);
