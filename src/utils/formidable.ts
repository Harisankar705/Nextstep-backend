import { Formidable, File as PersistentFile } from 'formidable';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const profilePictureUploadDir = path.join(__dirname, 'uploads', 'profile-pictures');
const companyLogoUploadDir = path.join(__dirname, 'uploads', 'company-logo');

[profilePictureUploadDir, companyLogoUploadDir].forEach(dir => {
    fs.mkdir(dir, { recursive: true }, (err) => {
        if (err) console.error('Error creating directory:', err);
    });
});

export const handleFileUpload = (
    req: Request,
    allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/svg+xml',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxFilesize = 500 * 1024 * 1024
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const form = new Formidable({
            uploadDir: req.url.includes('logo') ? companyLogoUploadDir : profilePictureUploadDir,
            maxFileSize: maxFilesize,
            keepExtensions: true,
            multiples: true,
            filter: ({ mimetype }) => {
                return mimetype ? allowedTypes.includes(mimetype) : false;
            },
            filename: (name, ext, part) => {
                return `${Date.now()}-${part.originalFilename}`; 
            }
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Error occurred while parsing form data:', err);
                reject({ error: 'Error occurred while parsing form data', details: err });
                return;
            }

            let newFields = fields; 

            if (fields.logo && Array.isArray(fields.logo) && fields.logo[0] && fields.logo[0].startsWith('data:image')) {
                const base64Data = fields.logo[0].split(';base64,').pop();
                if (base64Data) {
                    const fileName = `logo-${Date.now()}.png`;
                    const filePath = path.join(companyLogoUploadDir, fileName);
                    fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
                    (files as any).logo = [{
                        filepath: filePath
                    }] as PersistentFile[];
                }
                newFields = Object.fromEntries(
                    Object.entries(fields).filter(([key]) => key !== 'logo')
                );
            }

            const fileNames: { profilePicture?: string, resumeFile?: string, logo?: string } = {};

            const processFile = (fileKey: keyof typeof fileNames) => {
                const uploadedFiles = files[fileKey] as PersistentFile[];
                if (uploadedFiles?.[0]?.filepath) {
                    fileNames[fileKey] = uploadedFiles[0].filepath;
                }
            };

            processFile('profilePicture');
            processFile('resumeFile');
            processFile('logo');

            resolve({
                message: 'Files uploaded successfully!',
                fileNames,
                fields: newFields
            });
        });
    });
};
