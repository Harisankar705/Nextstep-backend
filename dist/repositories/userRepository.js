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
exports.UserRepository = void 0;
const mongoose_1 = require("mongoose");
const modelUtil_1 = require("../utils/modelUtil");
const baseRepository_1 = require("./baseRepository");
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
let UserRepository = class UserRepository extends baseRepository_1.BaseRepository {
    constructor(userModel, employerModel, postModel) {
        super(userModel);
        this.userModel = userModel;
        this.employerModel = employerModel;
        this.postModel = postModel;
    }
    async findByEmail(email, role) {
        try {
            const model = (0, modelUtil_1.getModel)(role);
            if (role === 'employer') {
                return model.findOne({ email }).exec();
            }
            if (role === 'user') {
                return model.findOne({ email }).exec();
            }
            if (role === 'admin') {
                return model.findOne({ email }).exec();
            }
            throw new Error(`Invalid role: ${role}`);
        }
        catch (error) {
            throw new Error('Error occurred while finding by email');
        }
    }
    async search(query) {
        try {
            if (!query) {
                throw new Error("query not found");
            }
            const [users, posts, employers] = await Promise.all([
                this.userModel.find({
                    $or: [
                        { firstName: { $regex: query, $options: 'i' } },
                        { secondName: { $regex: query, $options: 'i' } }
                    ]
                }).select('-password'),
                this.postModel.find({
                    $or: [
                        { location: { $regex: query, $options: 'i' } },
                        { text: { $regex: query, $options: 'i' } }
                    ]
                }),
                this.employerModel.find({
                    $or: [
                        { companyName: { $regex: query, $options: 'i' } },
                    ]
                })
            ]);
            return { users, posts, employers };
        }
        catch (error) {
            throw error;
        }
    }
    async findUserPosts(userId) {
        try {
            const posts = await this.postModel.find({ userId }).sort({ createdAt: -1 })
                .lean()
                .populate('likes')
                .populate('comments');
            return posts;
        }
        catch (error) {
            throw new Error("Error occured in findUserPosts");
        }
    }
    async findUserById(userId, role) {
        try {
            const model = (0, modelUtil_1.getModel)(role);
            console.log("MODEL", model);
            if (role === 'employer') {
                return model.findById(userId).exec();
            }
            if (role === 'user') {
                return model.findById(userId).exec();
            }
            if (role === 'admin') {
                return model.findById(userId).exec();
            }
            throw new Error(`Invalid role: ${role}`);
        }
        catch (error) {
            throw new Error('Error occurred while finding by email');
        }
    }
    async createUser(userData, role) {
        try {
            const model = (0, modelUtil_1.getModel)(role);
            if (role === 'employer') {
                const employer = new model(userData);
                return await employer.save();
            }
            if (role === 'user') {
                const user = new model(userData);
                return await user.save();
            }
            throw new Error(`Invalid role: ${role}`);
        }
        catch (error) {
            throw new Error("error occured while creating candidate");
        }
    }
    async createPost(postData, role, userId) {
        try {
            const model = (0, modelUtil_1.getModel)(role);
            const user = await model.findById(userId);
            if (!user) {
                throw new Error("user not found in createpost");
            }
            const newPost = { ...postData, userId: userId, createdAt: new Date(), userType: role === 'employer' ? 'employer' : 'user' };
            const savedPost = await this.postModel.create(newPost);
            if (savedPost) {
            }
            return savedPost;
        }
        catch (error) {
            throw new Error("Error creating post");
        }
    }
    async editPost(postId, updatePostData, role, userId) {
        try {
            const model = (0, modelUtil_1.getModel)(role);
            const user = await model.findById(userId);
            if (!user) {
                throw new Error("user not found in createpost");
            }
            const post = await this.postModel.findById(postId);
            if (!post) {
                throw new Error("Post not found!");
            }
            const updatedPost = { ...updatePostData, updatedAt: new Date() };
            const savedPost = await this.postModel.findByIdAndUpdate(postId, updatePostData, { new: true });
            return savedPost;
        }
        catch (error) {
            throw new Error("Error updating post");
        }
    }
    async updateUser(userId, userData) {
        try {
            const objectId = new mongoose_1.Types.ObjectId(userId);
            const user = await this.userModel.findById(objectId);
            if (!user) {
                throw new Error("User not found");
            }
            const updatePayLoad = {
                ...user.toObject(),
                ...userData,
            };
            updatePayLoad.isProfileComplete =
                !!(updatePayLoad.profilePicture &&
                    updatePayLoad.resume &&
                    updatePayLoad.experience &&
                    updatePayLoad.skills?.length &&
                    updatePayLoad.education?.length);
            const updatedUser = await this.userModel.findByIdAndUpdate(objectId, { $set: { ...updatePayLoad, isProfileComplete: true } }, { new: true });
            return updatedUser;
        }
        catch (error) {
            throw new Error("Error occurred while updating user");
        }
    }
};
exports.UserRepository = UserRepository;
exports.UserRepository = UserRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.UserModel)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.EmployerModel)),
    __param(2, (0, inversify_1.inject)(types_1.TYPES.PostModel)),
    __metadata("design:paramtypes", [mongoose_1.Model, mongoose_1.Model, mongoose_1.Model])
], UserRepository);
