"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDTO = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const validateDTO = async (dtoClass, body) => {
    const dtoInstance = (0, class_transformer_1.plainToInstance)(dtoClass, body);
    const errors = await (0, class_validator_1.validate)(dtoInstance);
    if (errors.length > 0) {
        throw new Error(JSON.stringify(errors.map(err => err.constraints)));
    }
    return dtoInstance;
};
exports.validateDTO = validateDTO;
