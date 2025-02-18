import { Response, Request, NextFunction } from 'express';
import { handleFileUpload } from "../utils/formidable";
import EmployerService from '../services/employerService';
import { STATUS_CODES } from '../utils/statusCode';
import { IEmployerController } from '../types/controllerinterface';
import { TYPES } from '../types/types';
import { inject } from 'inversify';

export class EmployerController implements IEmployerController {
    constructor(@inject(TYPES.EmployerService)private employerService:EmployerService){}
    public employerDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized. UserId is required!" });
                return;
            }
    
            const isEdit = req.query.isEdit === 'true';
    
            
            let uploadResponse;
            try {
                uploadResponse = await handleFileUpload(req);
                if (!uploadResponse || !uploadResponse.fields || !uploadResponse.fileNames) {
                    res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid form data" });
                    return;
                }
            } catch (error) {
                console.error("File upload error:", error);
                res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "File upload failed" });
                return;
            }
    
            
            const { logo, document } = uploadResponse.fileNames;
            const validDocumentTypes = ["GST", "PAN", "INCORPORATION", "OTHER"] as const;
            const documentType = validDocumentTypes.includes(uploadResponse.fields.documentType?.[0] as any)
                ? (uploadResponse.fields.documentType?.[0] as "GST" | "PAN" | "INCORPORATION" | "OTHER")
                : undefined;
                const dateFounded = uploadResponse.fields.dateFounded?.[0] 
                ? new Date(uploadResponse.fields.dateFounded[0]) 
                : undefined;
            
            const data = {
                companyName: uploadResponse.fields.companyName?.[0] || "",
                website: uploadResponse.fields.website?.[0] || "",
                location: uploadResponse.fields.location?.[0] || "",
                employees: uploadResponse.fields.employees?.[0] || "",
                industry: uploadResponse.fields.industry?.[0] || "",
                dateFounded,
                logo: logo || "",
                document: document || "",
                documentType,
                documentNumber: uploadResponse.fields.documentNumber?.[0] || "",
                description: uploadResponse.fields.description?.[0] || ""
            };
    
            
            if (!data.companyName || !data.industry || !data.location) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Missing required fields" });
                return;
            }
    
            
            const updatedUser = await this.employerService.updateUser(userId, data);
            
            res.status(STATUS_CODES.OK).json({
                updatedUser,
                success: true,
                isEdit,
                message: isEdit ? "Company details updated!" : "Company details added",
                redirectTo: "/employerhome"
            });
    
        } catch (error) {
            console.error("Error in employerDetails:", error);
            next(error);
        }
    };
    

    public isEmployerVerified = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const employerId = req.user?.userId;
            if (!employerId) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Employer ID is required" });
                return;
            }
            const isVerified = await this.employerService.isVerified(employerId);
            console.log(isVerified)
            res.status(STATUS_CODES.OK).json({ message: isVerified ? "isVerified" : "!isVerified" });
        } catch (error) {
            next(error);
        }
    };
}

