    import { NextFunction, Request, Response } from 'express';
    import { validateRole } from '../utils/roleValidate';
    import { AdminService } from '../services/adminService';
    import { STATUS_CODES } from '../utils/statusCode';
    import { IAdminController } from '../types/controllerinterface';
    import { inject, injectable } from 'inversify';
    import { TYPES } from '../types/types';
    import { IndividualDetailsDTO, ToggleUserDTO, VerifyUserDTO } from '../dtos/adminDTO';
    import { validateDTO } from '../dtos/validateDTO';
    import { AuthService } from '../services/authService';
    @injectable()
    export class AdminController implements IAdminController {
        constructor(@inject (TYPES.AdminService)private adminService:AdminService,@inject(TYPES.AuthService)private authService:AuthService){}
        async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const { role } = req.params;
                const roleValidation = validateRole(role);
                if (!roleValidation.valid) {
                    res.status(STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
                    return;
                }
                const response = await this.authService.getCandidateService(role);
                res.status(STATUS_CODES.OK).json(response);
            } catch (error) {
                next(error);
            }
        }
        async individualDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const { id } = req.params;
                const individualDetailsDTO=await validateDTO(IndividualDetailsDTO,req.body)
                const role = req.query.role as string;
                if (!id || typeof id !== 'string') {
                    res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Id not a string" });
                    return;
                }
                const response = await this.adminService.getIndividualDetails(id, role);
                res.status(STATUS_CODES.OK).json(response);
            } catch (error) {
                next(error);
            }
        }
        async toggleUser(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const toggleUserDTO=await validateDTO(ToggleUserDTO,req.body)
                const { id } = req.params;
               
                const roleValidation = validateRole(toggleUserDTO.role);
                if (!roleValidation.valid) {
                    res.status(STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
                    return;
                }
                const response = await this.adminService.toggleUser(id,toggleUserDTO.role);
                res.status(STATUS_CODES.OK).json({ success: true, message: "User status toggled successfully", data: response });
            } catch (error) {
                next(error);
            }
        }
        async verificationStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const id = req.params.id;
                const status = req.body.status;
                const verificationStatusDTO=await validateDTO(VerifyUserDTO,req.body)
                if (!id) {
                    res.status(STATUS_CODES.NOT_FOUND).json({ message: "id or status not provided" });
                    return;
                }
                const response = await this.adminService.verifyUser(id, verificationStatusDTO.status);
                res.status(STATUS_CODES.OK).json({ success: true, message: `Approval has been successfully ${verificationStatusDTO.status}` });
            } catch (error) {
                next(error);
            }
        }
        async adminLogout(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                res.clearCookie('adminToken', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
            } catch (error) {
                next(error);
            }
        }
    }
