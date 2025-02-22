"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileExtension = exports.getAbsoluteFilePath = exports.handleFileUpload = void 0;
const formidable_1 = require("formidable");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define constants
const UPLOAD_BASE_DIR = path_1.default.join(__dirname, "uploads");
const PROFILE_PICTURE_DIR = path_1.default.join(UPLOAD_BASE_DIR, "profile-pictures");
const POST_DIR = path_1.default.join(UPLOAD_BASE_DIR, "posts");
const COMPANY_LOGO_DIR = path_1.default.join(UPLOAD_BASE_DIR, "company-logos");
const CHAT_DIR = path_1.default.join(UPLOAD_BASE_DIR, "chat");
const COMPANY_DOCUMENTS_DIR = path_1.default.join(UPLOAD_BASE_DIR, "company-documents");
// Define allowed file types
const ALLOWED_IMAGE_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/svg+xml",
];
const ALLOWED_DOCUMENT_TYPES = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
;
const MAX_FILE_SIZE = 500 * 1024 * 1024;
const sanitizeFileName = (originalName) => {
    return originalName
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .toLowerCase()
        .slice(0, 100);
};
const determineUploadDirectory = (req) => {
    if (req.url.includes("logo"))
        return COMPANY_LOGO_DIR;
    if (req.url.includes("/chat-files"))
        return CHAT_DIR;
    if (req.url.includes("document") || req.url.includes("employer"))
        return COMPANY_DOCUMENTS_DIR;
    if (req.url.includes("post"))
        return POST_DIR;
    return PROFILE_PICTURE_DIR;
};
const createUploadDirectories = () => {
    const directories = [
        UPLOAD_BASE_DIR,
        PROFILE_PICTURE_DIR,
        COMPANY_LOGO_DIR,
        COMPANY_DOCUMENTS_DIR,
        POST_DIR,
        CHAT_DIR,
    ];
    directories.forEach((dir) => {
        try {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        catch (err) {
            throw new Error(`Failed to create directory: ${dir}`);
        }
    });
};
const generateUniqueFileName = (originalName, prefix) => {
    const sanitizedName = sanitizeFileName(originalName);
    const timestamp = Date.now();
    const fileExt = path_1.default.extname(sanitizedName);
    const baseName = path_1.default.basename(sanitizedName, fileExt);
    return `${prefix ? prefix + "-" : ""}${timestamp}-${baseName}${fileExt}`;
};
const isValidFileType = (mimetype, allowedTypes) => {
    return mimetype ? allowedTypes.includes(mimetype) : false;
};
const handleBase64Upload = (base64Data, uploadDir, prefix = "logo") => {
    try {
        if (!base64Data || !base64Data.startsWith("data:image"))
            return null;
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3)
            return null;
        const mimeType = matches[1];
        const base64String = matches[2];
        const fileExt = mimeType.split("/")[1];
        const fileName = `${prefix}-${Date.now()}.${fileExt}`;
        const filePath = path_1.default.join(uploadDir, fileName);
        fs_1.default.writeFileSync(filePath, base64String, { encoding: "base64" });
        return filePath;
    }
    catch (error) {
        throw new Error("Failed to handle base64 upload");
    }
};
const handleFileUpload = (req, options = {}) => {
    createUploadDirectories();
    return new Promise((resolve, reject) => {
        const uploadDir = determineUploadDirectory(req);
        const allowedTypes = [
            ...(options.allowedImageTypes || ALLOWED_IMAGE_TYPES),
            ...(options.allowedDocumentTypes || ALLOWED_DOCUMENT_TYPES),
        ];
        const form = new formidable_1.Formidable({
            uploadDir,
            maxFileSize: options.maxFileSize || MAX_FILE_SIZE,
            keepExtensions: true,
            multiples: true,
            filter: ({ mimetype }) => isValidFileType(mimetype, allowedTypes),
            filename: (name, ext, part) => {
                const originalName = part.originalFilename || "unknown";
                const prefix = typeof part.name === "string" ? part.name : "file";
                return generateUniqueFileName(originalName, prefix);
            },
        });
        form.parse(req, (err, fields, files) => {
            if (err) {
                return reject({
                    error: "Error parsing form data",
                    details: err,
                });
            }
            const mutableFields = fields;
            if (Array.isArray(fields.logo) &&
                typeof fields.logo[0] === "string" &&
                fields.logo[0].startsWith("data:image")) {
                const logoPath = handleBase64Upload(fields.logo[0], COMPANY_LOGO_DIR);
                if (logoPath) {
                    files.logo = [{ filepath: logoPath }];
                }
                delete mutableFields.logo;
            }
            const fileNames = {};
            const fileKeys = [
                "profilePicture",
                "resumeFile",
                "logo",
                "document",
                "postImage",
                "file"
            ];
            fileKeys.forEach((fileKey) => {
                const uploadedFiles = files[fileKey];
                if (uploadedFiles?.length) {
                    try {
                        if (fileKey === 'postImage') {
                            fileNames[fileKey] = uploadedFiles.map(file => path_1.default.normalize(file.filepath));
                        }
                        else {
                            fileNames[fileKey] = path_1.default.normalize(uploadedFiles[0].filepath);
                        }
                    }
                    catch (error) {
                        throw new Error(`Failed to process file: ${fileKey}`);
                    }
                }
            });
            resolve({
                message: "Files uploaded successfully!",
                fileNames: fileNames,
                fields: mutableFields,
            });
        });
    });
};
exports.handleFileUpload = handleFileUpload;
const getAbsoluteFilePath = (relativePath) => {
    return path_1.default.isAbsolute(relativePath)
        ? path_1.default.normalize(relativePath)
        : path_1.default.join(process.cwd(), relativePath);
};
exports.getAbsoluteFilePath = getAbsoluteFilePath;
const validateFileExtension = (filename) => {
    const validExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".docx"];
    const ext = path_1.default.extname(filename).toLowerCase();
    return validExtensions.includes(ext);
};
exports.validateFileExtension = validateFileExtension;
