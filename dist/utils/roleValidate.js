"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRole = void 0;
const validateRole = (role) => {
    if (!['user', 'employer', 'admin'].includes(role)) {
        return { valid: false, message: "Role is invalid!" };
    }
    return { valid: true };
};
exports.validateRole = validateRole;
