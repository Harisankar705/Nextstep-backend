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
exports.ReportService = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../types/types");
const reportRepository_1 = require("../repositories/reportRepository");
const modelUtil_1 = require("../utils/modelUtil");
let ReportService = class ReportService {
    constructor(reportRepository) {
        this.reportRepository = reportRepository;
    }
    async createReport(reportData, userId) {
        const model = await (0, modelUtil_1.getModel)(reportData.role);
        const reporter = await model.findById(userId);
        if (!reporter) {
            throw new Error("Reporter not found");
        }
        const newReport = await this.reportRepository.createReport(reportData, model, reporter._id);
        return newReport;
    }
    async getReports(filter = {}) {
        return await this.reportRepository.getReports(filter);
    }
    async changeReportStatus(reportId, newStatus) {
        const result = await this.reportRepository.changeStatus(reportId, newStatus);
        return result ? true : false;
    }
};
exports.ReportService = ReportService;
exports.ReportService = ReportService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.ReportRepository)),
    __metadata("design:paramtypes", [reportRepository_1.ReportRepository])
], ReportService);
