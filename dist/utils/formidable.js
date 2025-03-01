"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileExtension = exports.getS3FileUrl = exports.handleFileUpload = void 0;
const formidable_1 = require("formidable");
const path_1 = __importDefault(require("path"));
const client_s3_1 = require("@aws-sdk/client-s3");
const lib_storage_1 = require("@aws-sdk/lib-storage");
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
console.log("AWS Region:", process.env.AWS_REGION);
console.log("S3 Bucket Name:", process.env.AWS_BUCKET_NAME);
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION || "eu-north-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    }
});
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "your-bucket-name";
const PROFILE_PICTURE_PREFIX = "profile-pictures/";
const POST_PREFIX = "posts/";
const COMPANY_LOGO_PREFIX = "company-logos/";
const CHAT_PREFIX = "chat/";
const COMPANY_DOCUMENTS_PREFIX = "company-documents/";
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
const MAX_FILE_SIZE = 500 * 1024 * 1024;
const sanitizeFileName = (originalName) => {
    return originalName
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .toLowerCase()
        .slice(0, 100);
};
const determineS3Prefix = (req) => {
    if (req.url.includes("logo"))
        return COMPANY_LOGO_PREFIX;
    if (req.url.includes("/chat-files"))
        return CHAT_PREFIX;
    if (req.url.includes("document") || req.url.includes("employer"))
        return COMPANY_DOCUMENTS_PREFIX;
    if (req.url.includes("post"))
        return POST_PREFIX;
    return PROFILE_PICTURE_PREFIX;
};
const generateUniqueFileName = (originalName, prefix) => {
    const sanitizedName = sanitizeFileName(originalName);
    const uuid = (0, uuid_1.v4)();
    const fileExt = path_1.default.extname(sanitizedName);
    const baseName = path_1.default.basename(sanitizedName, fileExt);
    return `${prefix ? prefix + "-" : ""}${uuid}-${baseName}${fileExt}`;
};
const isValidFileType = (mimetype, allowedTypes) => {
    return mimetype ? allowedTypes.includes(mimetype) : false;
};
// Helper to determine file type-based prefix
const determineFilePrefix = (mimetype) => {
    if (!mimetype)
        return POST_PREFIX;
    if (mimetype.startsWith("image/")) {
        return POST_PREFIX;
    }
    else {
        return COMPANY_DOCUMENTS_PREFIX;
    }
};
const uploadFileToS3 = async (file) => {
    if (!file || !file.filepath) {
        throw new Error("Invalid file object");
    }
    if (!fs_1.default.existsSync(file.filepath)) {
        throw new Error(`File does not exist at path: ${file.filepath}`);
    }
    const fileStream = fs_1.default.createReadStream(file.filepath);
    const s3Key = `${determineFilePrefix(file.mimetype || undefined)}${path_1.default.basename(file.filepath)}`;
    const upload = new lib_storage_1.Upload({
        client: s3Client,
        params: {
            Bucket: AWS_BUCKET_NAME,
            Key: s3Key,
            Body: fileStream,
            ContentType: file.mimetype || undefined,
            ACL: "public-read"
        }
    });
    await upload.done();
    try {
        if (fs_1.default.existsSync(file.filepath)) {
            fs_1.default.unlinkSync(file.filepath);
        }
    }
    catch (error) {
        console.warn(`Failed to delete temporary file: ${file.filepath}`, error);
    }
    return `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
};
const handleBase64Upload = async (base64Data, s3Prefix, prefix = "logo") => {
    try {
        if (!base64Data || !base64Data.startsWith("data:image"))
            return null;
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3)
            return null;
        const mimeType = matches[1];
        const base64String = matches[2];
        const buffer = Buffer.from(base64String, 'base64');
        const fileExt = mimeType.split("/")[1];
        const fileName = `${prefix}-${(0, uuid_1.v4)()}.${fileExt}`;
        const s3Key = `${s3Prefix}${fileName}`;
        const upload = new lib_storage_1.Upload({
            client: s3Client,
            params: {
                Bucket: AWS_BUCKET_NAME,
                Key: s3Key,
                Body: buffer,
                ContentType: mimeType,
                ACL: "public-read"
            }
        });
        await upload.done();
        return `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
    }
    catch (error) {
        throw new Error("Failed to handle base64 upload");
    }
};
const handleFileUpload = (req, options = {}) => {
    return new Promise((resolve, reject) => {
        const tempDir = path_1.default.join(process.cwd(), "temp");
        try {
            fs_1.default.mkdirSync(tempDir, { recursive: true });
        }
        catch (err) {
            return reject({
                error: "Failed to create temporary directory",
                details: err,
            });
        }
        const s3Prefix = determineS3Prefix(req);
        const allowedTypes = [
            ...(options.allowedImageTypes || ALLOWED_IMAGE_TYPES),
            ...(options.allowedDocumentTypes || ALLOWED_DOCUMENT_TYPES),
        ];
        const form = new formidable_1.Formidable({
            uploadDir: tempDir,
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
        form.parse(req, async (err, fields, files) => {
            if (err) {
                return reject({
                    error: "Error parsing form data",
                    details: err,
                });
            }
            const mutableFields = fields;
            const fileNames = {};
            try {
                if (Array.isArray(fields.logo) &&
                    typeof fields.logo[0] === "string" &&
                    fields.logo[0].startsWith("data:image")) {
                    const logoUrl = await handleBase64Upload(fields.logo[0], COMPANY_LOGO_PREFIX);
                    if (logoUrl) {
                        fileNames.logo = logoUrl;
                    }
                    delete mutableFields.logo;
                }
                const fileKeys = [
                    "profilePicture",
                    "resumeFile",
                    "logo",
                    "document",
                    "postImage",
                    "file"
                ];
                for (const fileKey of fileKeys) {
                    const uploadedFiles = files[fileKey];
                    if (uploadedFiles?.length) {
                        try {
                            if (fileKey === 'postImage') {
                                const s3Urls = [];
                                for (const file of uploadedFiles) {
                                    if (file && file.filepath) {
                                        const s3Url = await uploadFileToS3(file);
                                        s3Urls.push(s3Url);
                                    }
                                }
                                if (s3Urls.length > 0) {
                                    fileNames[fileKey] = s3Urls;
                                }
                            }
                            else {
                                const file = uploadedFiles[0];
                                if (file && file.filepath) {
                                    const s3Url = await uploadFileToS3(file);
                                    fileNames[fileKey] = s3Url;
                                }
                            }
                        }
                        catch (error) {
                            console.error(`Failed to upload ${fileKey} to S3:`, error);
                            throw new Error(`Failed to upload ${fileKey} to S3`);
                        }
                    }
                }
                resolve({
                    message: "Files uploaded successfully to S3!",
                    fileNames: fileNames,
                    fields: mutableFields,
                });
            }
            catch (error) {
                if (files) {
                    Object.values(files).forEach(fileArray => {
                        if (Array.isArray(fileArray)) {
                            fileArray.forEach(file => {
                                try {
                                    if (file && file.filepath && fs_1.default.existsSync(file.filepath)) {
                                        fs_1.default.unlinkSync(file.filepath);
                                    }
                                }
                                catch (e) {
                                    console.warn("Error cleaning up temporary file:", e);
                                }
                            });
                        }
                    });
                }
                reject({
                    error: "Error uploading files to S3",
                    details: error,
                });
            }
        });
    });
};
exports.handleFileUpload = handleFileUpload;
const getS3FileUrl = (key) => {
    return `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
};
exports.getS3FileUrl = getS3FileUrl;
const validateFileExtension = (filename) => {
    const validExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".docx"];
    const ext = path_1.default.extname(filename).toLowerCase();
    return validExtensions.includes(ext);
};
exports.validateFileExtension = validateFileExtension;
