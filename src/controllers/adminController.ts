import { Request,Response } from 'express';
import { validateRole } from '../utils/roleValidate';
import AuthService from '../services/authService';
import {ParsedQs} from 'qs'
import { AdminService } from '../services/adminService';
const authService = new AuthService()
const adminService=new AdminService()


export const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { role } = req.params;
        const roleValidation = validateRole(role);
        if (!roleValidation.valid) {
            res.status(400).json({ message: roleValidation.message });
            return;
        }
        const authService = new AuthService();
        const response = await authService.getCandidateService(role);


        res.status(200).json(response);
    } catch (error) {
        const err = error as Error
        res.status(400).json({ message: err.message })
    }
};
export const individualDetails=async(req:Request,res:Response):Promise<void>=>{
    try {
        const {id}=req.params
        const role=req.body
        console.log(id)
        
        
        if(!id||typeof id!=='string')
        {
             res.status(400).json({message:"Id not a string"})
             return
        }
        const response=await adminService.getIndividualDetails(id,role)
        res.status(200).json(response)

    }
     catch (error) {
        const err = error as Error
        res.status(400).json({ message: err.message })
    }
}
export const toggleuser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params
        const { role } = req.body

        if (!id || !role) {
            res.status(404).json({ message: "id or role is undefined" })
            return
        }
        const roleValidation = validateRole(role)
        if (!roleValidation.valid) {
            res.status(400).json({ message: roleValidation.message });
            return;
        }
        const response = await adminService.toggleUser(id, role)
        res.status(200).json({ success: true, message: "User status toogled successfully", data: response })


    }
    catch (error) {
        const err = error as Error
        res.status(400).json({ message: err.message })
    }
}
export const verificationStatus=async(req:Request,res:Response):Promise<void>=>{
    try
    {
        const id=req.params.id
        const status=req.body.status
        console.log('in verificatinstatus')
        if(!id || !status)
        {
            res.status(404).json({message:"id or status not provided"})
        }
        const response = await adminService.verifyUser(id,status)
        res.status(200).json({success:true,message:`approval has been successfully ${status}`})
    }
    catch(error)
    {
        const err=error as Error
        res.status(400).json({message:err.message})
    }
}