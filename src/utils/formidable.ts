import { Formidable, File as PersistentFile } from 'formidable';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const uploadDir = path.join(__dirname, 'uploads', 'profile-pictures');

fs.mkdir(uploadDir, { recursive: true }, (err) => {
    if (err) {
        console.error('Error creating directory:', err);
    } else {
    }
});

export const handleFileUpload = (
    req: Request,
    allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 
        'application/pdf', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxFilesize = 500 * 1024 * 1024 
): Promise<any> => {
    return new Promise((resolve, reject) => {
        const form = new Formidable({
            uploadDir,
            maxFileSize: maxFilesize,
            keepExtensions: true,
            multiples: true, 
        });

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error('Error occurred while parsing form data:', err);
                reject({ error: 'Error occurred while parsing form data', details: err });
                return;
            }

            const fileNames: { profilePicture?: string, resume?: string } = {};

            const profilePictureFile = files.profilePicture as PersistentFile[];
            if (profilePictureFile && profilePictureFile.length > 0) {
                const file = profilePictureFile[0];
                if (file && file.filepath) {
                    fileNames.profilePicture = file.filepath; 
                }
            }

            const resumeFile = files.resumeFile as PersistentFile[];
            if (resumeFile && resumeFile.length > 0) {
                const file = resumeFile[0];
                if (file && file.filepath) {
                    fileNames.resume = file.filepath; 
                }
            }

            resolve({
                message: 'Files uploaded successfully!',
                fileNames, 
                fields
            });
        });
    });
};
