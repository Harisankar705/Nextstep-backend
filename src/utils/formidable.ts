import formidable, { File } from "formidable";
import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";
import { Request } from "express";

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

interface FileNames {
  [key: string]: string | string[];
}

export const handleFileUpload = (req: Request): Promise<{ fileNames: FileNames; fields: formidable.Fields }> => {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return reject(err);
      }

      const fileNames: FileNames = {};

      const uploadFileToS3 = async (file: File, fileKey: string): Promise<string> => {
        const fileContent = fs.readFileSync(file.filepath);
        const fileExtension = path.extname(file.originalFilename || "");
        const s3Key = `uploads/${Date.now()}-${file.newFilename}${fileExtension}`;

        const params = {
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: s3Key,
          Body: fileContent,
          ContentType: file.mimetype || "application/octet-stream",
          ACL: "public-read",
        };

        const s3Response = await s3.upload(params).promise();
        return s3Response.Location;
      };

      try {
        for (const fileKey in files) {
          const fileData = files[fileKey];

          // Ensure fileData is defined
          if (!fileData) continue;

          const fileArray = Array.isArray(fileData) ? fileData : [fileData];

          // Filter out any undefined files just to be safe
          const s3Urls = await Promise.all(
            fileArray
              .filter((f): f is File => !!f) // Type guard to ensure f is of type File
              .map((f) => uploadFileToS3(f, fileKey))
          );

          // Conditional handling for postImage as array
          if (fileKey === "postImage") {
            (fileNames as FileNames)[fileKey] = s3Urls;
          } else {
            (fileNames as FileNames)[fileKey] = s3Urls[0];
          }
        }

        resolve({ fileNames, fields });
      } catch (uploadError) {
        reject(uploadError);
      }
    });
  });
};
