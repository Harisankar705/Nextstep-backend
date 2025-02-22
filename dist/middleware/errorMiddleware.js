"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const statusCode_1 = require("../utils/statusCode");
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || statusCode_1.STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: err.message || "Something went wrong"
    });
};
exports.errorHandler = errorHandler;
