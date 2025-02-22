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
exports.EmployerController = void 0;
const formidable_1 = require("../utils/formidable");
const employerService_1 = __importDefault(require("../services/employerService"));
const statusCode_1 = require("../utils/statusCode");
const types_1 = require("../types/types");
const inversify_1 = require("inversify");
let EmployerController = class EmployerController {
    constructor(employerService) {
        this.employerService = employerService;
        this.employerDetails = async (req, res, next) => {
            try {
                const userId = req.user?.userId;
                if (!userId) {
                    res.status(statusCode_1.STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized. UserId is required!" });
                    return;
                }
                const isEdit = req.query.isEdit === 'true';
                let uploadResponse;
                try {
                    uploadResponse = await (0, formidable_1.handleFileUpload)(req);
                    if (!uploadResponse || !uploadResponse.fields || !uploadResponse.fileNames) {
                        res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Invalid form data" });
                        return;
                    }
                }
                catch (error) {
                    console.error("File upload error:", error);
                    res.status(statusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "File upload failed" });
                    return;
                }
                const { logo, document } = uploadResponse.fileNames;
                const validDocumentTypes = ["GST", "PAN", "INCORPORATION", "OTHER"];
                const documentType = validDocumentTypes.includes(uploadResponse.fields.documentType?.[0])
                    ? uploadResponse.fields.documentType?.[0]
                    : undefined;
                const dateFounded = uploadResponse.fields.dateFounded?.[0]
                    ? new Date(uploadResponse.fields.dateFounded[0])
                    : undefined;
                const data = {
                    companyName: uploadResponse.fields.companyName?.[0] || "",
                    website: uploadResponse.fields.website?.[0] || "",
                    location: uploadResponse.fields.location?.[0] || "",
                    employees: uploadResponse.fields.employees?.[0] || "",
                    industry: uploadResponse.fields.industry?.[0] || "",
                    dateFounded,
                    logo: logo || "",
                    document: document || "",
                    documentType,
                    documentNumber: uploadResponse.fields.documentNumber?.[0] || "",
                    description: uploadResponse.fields.description?.[0] || ""
                };
                if (!data.companyName || !data.industry || !data.location) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Missing required fields" });
                    return;
                }
                const updatedUser = await this.employerService.updateUser(userId, data);
                res.status(statusCode_1.STATUS_CODES.OK).json({
                    updatedUser,
                    success: true,
                    isEdit,
                    message: isEdit ? "Company details updated!" : "Company details added",
                    redirectTo: "/employerhome"
                });
            }
            catch (error) {
                console.error("Error in employerDetails:", error);
                next(error);
            }
        };
        this.isEmployerVerified = async (req, res, next) => {
            try {
                const employerId = req.user?.userId;
                if (!employerId) {
                    res.status(statusCode_1.STATUS_CODES.BAD_REQUEST).json({ message: "Employer ID is required" });
                    return;
                }
                const isVerified = await this.employerService.isVerified(employerId);
                console.log(isVerified);
                res.status(statusCode_1.STATUS_CODES.OK).json({ message: isVerified ? "isVerified" : "!isVerified" });
            }
            catch (error) {
                next(error);
            }
        };
    }
};
exports.EmployerController = EmployerController;
exports.EmployerController = EmployerController = __decorate([
    __param(0, (0, inversify_1.inject)(types_1.TYPES.EmployerService)),
    __metadata("design:paramtypes", [employerService_1.default])
], EmployerController);
