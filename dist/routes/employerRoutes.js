"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.employerRoutes = void 0;
const express_1 = __importDefault(require("express"));
const types_1 = require("../types/types");
const inversifyContainer_1 = require("../utils/inversifyContainer");
exports.employerRoutes = express_1.default.Router();
const employerController = inversifyContainer_1.container.get(types_1.TYPES.EmployerController);
const authMiddleware = inversifyContainer_1.container.get(types_1.TYPES.AuthMiddleware);
exports.employerRoutes.use(authMiddleware.verifyToken.bind(authMiddleware));
exports.employerRoutes.route('/employerdetails').post(employerController.employerDetails.bind(employerController));
exports.employerRoutes.route('/isVerified').get(employerController.isEmployerVerified.bind(employerController));
exports.default = exports.employerRoutes;
