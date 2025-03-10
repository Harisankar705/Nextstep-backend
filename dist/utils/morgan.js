"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const rfs = __importStar(require("rotating-file-stream"));
const path_1 = __importDefault(require("path"));
const node_cron_1 = __importDefault(require("node-cron"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const logsDir = path_1.default.join(__dirname, 'logs');
fs_extra_1.default.ensureDirSync(logsDir);
const loggerConfig = {
    interval: '1d',
    path: logsDir,
    size: '10M',
    compress: 'gzip'
};
const accessLogStream = rfs.createStream('access.log', loggerConfig);
morgan_1.default.token('timestamp', () => {
    return new Date().toISOString();
});
const logFormat = ':timestamp :method :url :status :res[content-length] - :response-time ms';
const morganMiddleware = (0, morgan_1.default)(logFormat, {
    stream: accessLogStream
});
node_cron_1.default.schedule('0 0 * * *', async () => {
    try {
        const files = await fs_extra_1.default.readdir(logsDir);
        const now = new Date();
        for (const file of files) {
            const filePath = path_1.default.join(logsDir, file);
            const stats = await fs_extra_1.default.stat(filePath);
            const fileAge = (now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
            if (fileAge > 7) {
                await fs_extra_1.default.unlink(filePath);
                console.log(`Deleted old log file: ${file}`);
            }
        }
    }
    catch (error) {
        console.error('Error cleaning up logs:', error);
    }
});
exports.default = morganMiddleware;
