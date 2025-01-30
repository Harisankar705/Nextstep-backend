import { NextFunction, Request,Response } from 'express';
import { validateRole } from '../utils/roleValidate';
import AuthService from '../services/authService';
import { AdminService } from '../services/adminService';
import { STATUS_CODES } from '../utils/statusCode';
const adminService=new AdminService()
export const getUsers = async (req: Request, res: Response,next:NextFunction): Promise<void> => {
    try {
        const { role } = req.params;
        const roleValidation = validateRole(role);
        if (!roleValidation.valid) {
            res.status(STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
            return;
        }
        const authService = new AuthService();
        const response = await authService.getCandidateService(role);
        res.status(STATUS_CODES.OK).json(response);
    } catch (error) {
        next(error)
    }
};
export const individualDetails=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try {
        const {id}=req.params
        const role=req.query.role as string
        if(!id||typeof id!=='string')
        {
             res.status(STATUS_CODES.BAD_REQUEST).json({message:"Id not a string"})
             return
        }
        const response=await adminService.getIndividualDetails(id,role)
        res.status(STATUS_CODES.OK).json(response)
    }
     catch (error) {
        next(error)
    }
}
export const toggleuser = async (req: Request, res: Response,next:NextFunction): Promise<void> => {
    try {
        const { id } = req.params
        const { role } = req.body
        if (!id || !role) {
            res.status(STATUS_CODES.NOT_FOUND).json({ message: "id or role is undefined" })
            return
        }
        const roleValidation = validateRole(role)
        if (!roleValidation.valid) {
            res.status(STATUS_CODES.BAD_REQUEST).json({ message: roleValidation.message });
            return;
        }
        const response = await adminService.toggleUser(id, role)
        res.status(STATUS_CODES.OK).json({ success: true, message: "User status toogled successfully", data: response })
    }
    catch (error) {
        next(error)
    }
}
export const verificationStatus=async(req:Request,res:Response,next:NextFunction):Promise<void>=>{
    try
    {
        const id=req.params.id
        const status=req.body.status
        if(!id || !status)
        {
            res.status(STATUS_CODES.NOT_FOUND).json({message:"id or status not provided"})
        }
        const response = await adminService.verifyUser(id,status)
        res.status(STATUS_CODES.OK).json({success:true,message:`approval has been successfully ${status}`})
    }
    catch(error)
    {
        next(error)
    }
}
export const adminLogout=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        res.clearCookie('adminToken',{httpOnly:true,secure:process.env.NODE_ENV==='production'})
    } catch (error) {
        next(error)
    }
}