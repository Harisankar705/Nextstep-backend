import { Formidable, File as PersistentFile } from "formidable";
import path from "path";
import { Request } from "express";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  }
});

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "your-bucket-name";

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
] as const;

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

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
}

interface UploadResult {
  message: string;
  fileNames: FileNames;
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

const determineS3Prefix = (req: Request): string => {
  if (req.url.includes("logo")) return COMPANY_LOGO_PREFIX;
  if (req.url.includes("/chat-files")) return CHAT_PREFIX;
  if (req.url.includes("document") || req.url.includes("employer"))
    return COMPANY_DOCUMENTS_PREFIX;
  if (req.url.includes("post")) return POST_PREFIX;
  return PROFILE_PICTURE_PREFIX;
};

const generateUniqueFileName = (
  originalName: string,
  prefix?: string
): string => {
  const sanitizedName = sanitizeFileName(originalName);
  const uuid = uuidv4();
  const fileExt = path.extname(sanitizedName);
  const baseName = path.basename(sanitizedName, fileExt);
  return `${prefix ? prefix + "-" : ""}${uuid}-${baseName}${fileExt}`;
};

const isValidFileType = (
  mimetype: string | null | undefined,
  allowedTypes: readonly string[]
): boolean => {
  return mimetype ? allowedTypes.includes(mimetype) : false;
};

// Helper to determine file type-based prefix
const determineFilePrefix = (mimetype: string | null | undefined): string => {
  if (!mimetype) return POST_PREFIX;
  
  if (mimetype.startsWith("image/")) {
    return POST_PREFIX;
  } else {
    return COMPANY_DOCUMENTS_PREFIX;
  }
};

const uploadFileToS3 = async (
  file: PersistentFile | undefined
): Promise<string> => {
  if (!file || !file.filepath) {
    throw new Error("Invalid file object");
  }
  
  if (!fs.existsSync(file.filepath)) {
    throw new Error(`File does not exist at path: ${file.filepath}`);
  }
  
  const fileStream = fs.createReadStream(file.filepath);
  const s3Key = `${determineFilePrefix(file.mimetype || undefined)}${path.basename(file.filepath)}`;
  
  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: S3_BUCKET_NAME,
      Key: s3Key,
      Body: fileStream,
      ContentType: file.mimetype || undefined,
      ACL: "public-read" 
    }
  });

  await upload.done();
  
  try {
    if (fs.existsSync(file.filepath)) {
      fs.unlinkSync(file.filepath);
    }
  } catch (error) {
    console.warn(`Failed to delete temporary file: ${file.filepath}`, error);
  }
  
  return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
};

const handleBase64Upload = async (
  base64Data: string,
  s3Prefix: string,
  prefix = "logo"
): Promise<string | null> => {
  try {
    if (!base64Data || !base64Data.startsWith("data:image")) return null;
    
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    
    const mimeType = matches[1];
    const base64String = matches[2];
    const buffer = Buffer.from(base64String, 'base64');
    const fileExt = mimeType.split("/")[1];
    const fileName = `${prefix}-${uuidv4()}.${fileExt}`;
    const s3Key = `${s3Prefix}${fileName}`;
    
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: S3_BUCKET_NAME,
        Key: s3Key,
        Body: buffer,
        ContentType: mimeType,
        ACL: "public-read"
      }
    });

    await upload.done();
    
    return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${s3Key}`;
  } catch (error) {
    throw new Error("Failed to handle base64 upload");
  }
};

export const handleFileUpload = (
  req: Request,
  options: UploadOptions = {}
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const tempDir = path.join(process.cwd(), "temp");
    try {
      fs.mkdirSync(tempDir, { recursive: true });
    } catch (err) {
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

    const form = new Formidable({
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

      const mutableFields = fields as FormFields;
      const fileNames: Partial<Record<FileKey, string | string[]>> = {};
      
      try {
        if (
          Array.isArray(fields.logo) &&
          typeof fields.logo[0] === "string" &&
          fields.logo[0].startsWith("data:image")
        ) {
          const logoUrl = await handleBase64Upload(fields.logo[0], COMPANY_LOGO_PREFIX);
          if (logoUrl) {
            fileNames.logo = logoUrl;
          }
          delete mutableFields.logo;
        }

        const fileKeys: FileKey[] = [
          "profilePicture",
          "resumeFile",
          "logo",
          "document",
          "postImage",
          "file"
        ];

        for (const fileKey of fileKeys) {
          const uploadedFiles = (files as Record<string, PersistentFile[]>)[fileKey];
          
          if (uploadedFiles?.length) {
            try {
              if (fileKey === 'postImage') {
                const s3Urls: string[] = [];
                
                for (const file of uploadedFiles) {
                  if (file && file.filepath) {
                    const s3Url = await uploadFileToS3(file);
                    s3Urls.push(s3Url);
                  }
                }
                
                if (s3Urls.length > 0) {
                  fileNames[fileKey] = s3Urls;
                }
              } else {
                const file = uploadedFiles[0];
                if (file && file.filepath) {
                  const s3Url = await uploadFileToS3(file);
                  fileNames[fileKey] = s3Url;
                }
              }
            } catch (error) {
              console.error(`Failed to upload ${fileKey} to S3:`, error);
              throw new Error(`Failed to upload ${fileKey} to S3`);
            }
          }
        }

        resolve({
          message: "Files uploaded successfully to S3!",
          fileNames: fileNames as FileNames,
          fields: mutableFields,
        });
        
      } catch (error) {
        if (files) {
          Object.values(files).forEach(fileArray => {
            if (Array.isArray(fileArray)) {
              fileArray.forEach(file => {
                try {
                  if (file && file.filepath && fs.existsSync(file.filepath)) {
                    fs.unlinkSync(file.filepath);
                  }
                } catch (e) {
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

export const getS3FileUrl = (key: string): string => {
  return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
};

export const validateFileExtension = (filename: string): boolean => {
  const validExtensions = [".jpg", ".jpeg", ".png", ".pdf", ".docx"] as const;
  const ext = path.extname(filename).toLowerCase();
  return validExtensions.includes(ext as typeof validExtensions[number]);
};