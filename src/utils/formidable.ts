import { Formidable, File as PersistentFile } from "formidable";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Define constants
const UPLOAD_BASE_DIR = path.join(__dirname, "uploads");
const PROFILE_PICTURE_DIR = path.join(UPLOAD_BASE_DIR, "profile-pictures");
const POST_DIR = path.join(UPLOAD_BASE_DIR, "posts");
const COMPANY_LOGO_DIR = path.join(UPLOAD_BASE_DIR, "company-logos");
const CHAT_DIR = path.join(UPLOAD_BASE_DIR, "chat");
const COMPANY_DOCUMENTS_DIR = path.join(UPLOAD_BASE_DIR, "company-documents");

// Define allowed file types
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/svg+xml",
] as const;

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

// Type definitions
type AllowedImageType = typeof ALLOWED_IMAGE_TYPES[number];
type AllowedDocumentType = typeof ALLOWED_DOCUMENT_TYPES[number];
type AllowedFileType = AllowedImageType | AllowedDocumentType;

interface UploadOptions {
  allowedImageTypes?: readonly string[];
  allowedDocumentTypes?: readonly string[];
  maxFileSize?: number;
}

interface FileNames {
  postImage?: string[];  
  profilePicture?: string;  
  resumeFile?: string;
  logo?: string;
  document?: string;
  file?: string;
};
interface UploadResult {
    message: string;
    fileNames:FileNames,
    fields: FormFields;
}

type FileKey = 'profilePicture' | 'resumeFile' | 'logo' | 'document' | 'postImage' | 'file';

interface FormFields {
  [key: string]: string | string[];
}

const MAX_FILE_SIZE = 500 * 1024 * 1024;

const sanitizeFileName = (originalName: string): string => {
  return originalName
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .toLowerCase()
    .slice(0, 100);
};

const determineUploadDirectory = (req: Request): string => {
  if (req.url.includes("logo")) return COMPANY_LOGO_DIR;
  if (req.url.includes("/chat-files")) return CHAT_DIR;
  if (req.url.includes("document") || req.url.includes("employer"))
    return COMPANY_DOCUMENTS_DIR;
  if (req.url.includes("post")) return POST_DIR;
  return PROFILE_PICTURE_DIR;
};

const createUploadDirectories = (): void => {
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
      fs.mkdirSync(dir, { recursive: true });
    } catch (err) {
      throw new Error(`Failed to create directory: ${dir}`);
    }
  });
};

const generateUniqueFileName = (
  originalName: string,
  prefix?: string
): string => {
  const sanitizedName = sanitizeFileName(originalName);
  const timestamp = Date.now();
  const fileExt = path.extname(sanitizedName);
  const baseName = path.basename(sanitizedName, fileExt);
  return `${prefix ? prefix + "-" : ""}${timestamp}-${baseName}${fileExt}`;
};

const isValidFileType = (
  mimetype: string | null | undefined,
  allowedTypes: readonly string[]
): boolean => {
  return mimetype ? allowedTypes.includes(mimetype) : false;
};

const handleBase64Upload = (
  base64Data: string,
  uploadDir: string,
  prefix = "logo"
): string | null => {
  try {
    if (!base64Data || !base64Data.startsWith("data:image")) return null;
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    const mimeType = matches[1];
    const base64String = matches[2];
    const fileExt = mimeType.split("/")[1];
    const fileName = `${prefix}-${Date.now()}.${fileExt}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, base64String, { encoding: "base64" });
    return filePath;
  } catch (error) {
    throw new Error("Failed to handle base64 upload");
  }
};

export const handleFileUpload = (
  req: Request,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  createUploadDirectories();
  
  return new Promise((resolve, reject) => {
    const uploadDir = determineUploadDirectory(req);
    const allowedTypes = [
      ...(options.allowedImageTypes || ALLOWED_IMAGE_TYPES),
      ...(options.allowedDocumentTypes || ALLOWED_DOCUMENT_TYPES),
    ];

    const form = new Formidable({
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

      const mutableFields = fields as FormFields;
      
      if (
        Array.isArray(fields.logo) &&
        typeof fields.logo[0] === "string" &&
        fields.logo[0].startsWith("data:image")
      ) {
        const logoPath = handleBase64Upload(fields.logo[0], COMPANY_LOGO_DIR);
        if (logoPath) {
          (files as Record<string, PersistentFile[]>).logo = [{ filepath: logoPath } as PersistentFile];
        }
        delete mutableFields.logo;
      }

      const fileNames: Partial<Record<FileKey, string[]>> = {};
      const fileKeys: FileKey[] = [
        "profilePicture",
        "resumeFile",
        "logo",
        "document",
        "postImage",
        "file"
      ];

      fileKeys.forEach((fileKey) => {
        const uploadedFiles = (files as Record<string, PersistentFile[]>)[fileKey];
        if (uploadedFiles?.length) {
            try {
                if (fileKey === 'postImage') {
                  (fileNames as FileNames)[fileKey] = uploadedFiles.map(file => path.normalize(file.filepath));
                } else {
                  (fileNames as FileNames)[fileKey as Exclude<FileKey, 'postImage'>] = path.normalize(uploadedFiles[0].filepath);
                }
            } catch (error) {
                throw new Error(`Failed to process file: ${fileKey}`);
            }
        }
    });

      resolve({
        message: "Files uploaded successfully!",
        fileNames:fileNames as FileNames,
        fields: mutableFields,
      });
    });
  });
};

export const getAbsoluteFilePath = (relativePath: string): string => {
  return path.isAbsolute(relativePath)
    ? path.normalize(relativePath)
    : path.join(process.cwd(), relativePath);
};

export const validateFileExtension = (filename: string): boolean => {
  const validExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".docx"] as const;
  const ext = path.extname(filename).toLowerCase();
  return validExtensions.includes(ext as typeof validExtensions[number]);
};