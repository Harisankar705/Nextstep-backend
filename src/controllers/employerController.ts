import { Response, Request, NextFunction } from 'express';
import { handleFileUpload } from "../utils/formidable";
import EmployerService from '../services/employerService';
import { STATUS_CODES } from '../utils/statusCode';
import { IEmployerController } from '../types/controllerinterface';

class EmployerController implements IEmployerController {
    private employerService = new EmployerService();

    public employerDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized. UserId is required!" });
                return;
            }
            const isEdit = req.query.isEdit === 'true';
            const uploadResponse = await handleFileUpload(req);
            if (!uploadResponse || !uploadResponse.fields) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Invalid form data" });
                return;
            }
            const { logo } = uploadResponse.fileNames;
            const data = {
                companyName: uploadResponse.fields.companyName?.[0],
                website: uploadResponse.fields.website?.[0],
                location: uploadResponse.fields.location?.[0],
                employees: uploadResponse.fields.employees?.[0],
                industry: uploadResponse.fields.industry?.[0],
                dateFounded: uploadResponse.fields.dateFounded?.[0],
                logo: uploadResponse.fileNames.logo,
                document: uploadResponse.fileNames.document,
                documentType: uploadResponse.fields.documentType?.[0],
                documentNumber: uploadResponse.fields.documentNumber?.[0],
                description: uploadResponse.fields.description?.[0]
            };
            if (!data) {
                res.status(STATUS_CODES.BAD_REQUEST).json({ message: "No data provided for update" });
                return;
            }
            const updatedUser = await this.employerService.updateUser(userId, data);
            res.status(STATUS_CODES.OK).json({
                updatedUser,
                success: true,
                isEdit: isEdit,
                message: isEdit ? "Company details updated!" : "Company details added",
                redirectTo: isEdit ? '/employerhome' : "/employerhome"
            });
        } catch (error) {
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
            res.status(STATUS_CODES.OK).json({ message: isVerified ? "isVerified" : "!isVerified" });
        } catch (error) {
            next(error);
        }
    };
}
export const employerController = new EmployerController();

