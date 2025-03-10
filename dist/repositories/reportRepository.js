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
exports.ReportRepository = void 0;
const mongoose_1 = require("mongoose");
const types_1 = require("../types/types");
const baseRepository_1 = require("./baseRepository");
const inversify_1 = require("inversify");
const report_1 = require("../models/report");
const inversifyContainer_1 = require("../utils/inversifyContainer");
const modelUtil_1 = require("../utils/modelUtil");
let ReportRepository = class ReportRepository extends baseRepository_1.BaseRepository {
    constructor(reportModel, postModel) {
        super(reportModel);
        this.reportModel = reportModel;
        this.postModel = postModel;
    }
    async createReport(reportData, model, reporterId) {
        {
            try {
                const post = await this.postModel.findById(reportData.postId);
                console.log("POST", post);
                if (!post) {
                    throw new Error('Post not found');
                }
                const postOwnerModel = await (0, modelUtil_1.getModel)(post?.userType);
                const postOwner = await postOwnerModel.findById(post.userId);
                if (!postOwner) {
                    throw new Error('Post owner not found!');
                }
                const postOwnerEmail = postOwner.email;
                const user = postOwner;
                const subject = "Your post has been reported!";
                const text = `Hello,${user.firstName} Your post titled as ${post?.text} has been reported for the following reason ${reportData.reason}
        Post Details:
        -Content:${post?.text}
        -Created At:${post?.createdAt}
        -Report Reason:${reportData.reason}

        Please review your post and take necessary actions or else necessary actions will be taken from Nextstep's side
        Thank You
        Team Nextstep`;
                const emailService = inversifyContainer_1.container.get(types_1.TYPES.EmailService);
                await emailService.sendEmail(postOwnerEmail, subject, text);
                const newReport = new this.reportModel({
                    post: reportData.postId,
                    reporter: reporterId,
                    reporterModel: model.modelName,
                    reason: reportData.reason,
                    description: reportData.description || '',
                    createdAt: new Date(),
                    status: "pending"
                });
                return await newReport.save();
            }
            catch (error) {
                throw error;
            }
        }
    }
    async changeStatus(reportId, newStatus) {
        try {
            const updatedReport = await report_1.ReportModel.findByIdAndUpdate(reportId, { status: newStatus }, { new: true });
            return updatedReport !== null;
        }
        catch (error) {
            throw new Error("Error occured while changing report status");
        }
    }
    async getReports(filter = {}) {
        try {
            return await report_1.ReportModel.find(filter)
                .populate('post', 'text image createdAt  ')
                .populate('reporter', 'firstName lastName companyName profilePicture')
                .sort({ createdAt: -1 });
        }
        catch (error) {
            console.log('error', error);
            throw new Error("Error occured while fetching Reports!");
        }
    }
};
exports.ReportRepository = ReportRepository;
exports.ReportRepository = ReportRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ReportModel)),
    __param(1, (0, inversify_1.inject)(types_1.TYPES.PostModel)),
    __metadata("design:paramtypes", [mongoose_1.Model, mongoose_1.Model])
], ReportRepository);
