"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const postSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.ObjectId,
        refPath: "userType",
        required: true
    },
    userType: {
        type: String,
        required: true,
        enum: ['user', 'employer']
    },
    text: {
        type: String,
        required: true
    },
    image: {
        type: [String],
        required: true
    },
    background: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    comments: [{ type: mongoose_1.default.Schema.ObjectId, ref: "Comment" }],
    likes: [{ type: mongoose_1.default.Schema.ObjectId, ref: "Like" }]
});
exports.PostModel = mongoose_1.default.model("Post", postSchema);
