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
exports.ReportController = void 0;
const statusCode_1 = require("./../utils/statusCode");
const adminDTO_1 = require("./../dtos/adminDTO");
const reportService_1 = require("../services/reportService");
const types_1 = require("../types/types");
const inversify_1 = require("inversify");
const validateDTO_1 = require("../dtos/validateDTO");
let ReportController = class ReportController {
    constructor(reportService) {
        this.reportService = reportService;
    }
    async createReport(req, res, next) {
        try {
            const userId = req.user?.userId;
            const reportData = await (0, validateDTO_1.validateDTO)(adminDTO_1.CreateReportDTO, req.body);
            console.log('in createreport', reportData);
            const report = await this.reportService.createReport(reportData, userId);
            res.status(statusCode_1.STATUS_CODES.OK).json(report);
        }
        catch (error) {
            next(error);
        }
    }
    async getReports(req, res, next) {
        try {
            const reports = await this.reportService.getReports();
            console.log('reports', reports);
            res.status(statusCode_1.STATUS_CODES.OK).json(reports);
        }
        catch (error) {
            next(error);
        }
    }
    async changeReportStatus(req, res, next) {
        try {
            const { reportId, newStatus } = await (0, validateDTO_1.validateDTO)(adminDTO_1.ReportStatusDTO, req.body);
            const success = await this.reportService.changeReportStatus(reportId, newStatus);
            res.status(statusCode_1.STATUS_CODES.OK).json({ success });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.ReportController = ReportController;
exports.ReportController = ReportController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ReportService)),
    __metadata("design:paramtypes", [reportService_1.ReportService])
], ReportController);
