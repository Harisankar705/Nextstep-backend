import { Response,Request,NextFunction } from 'express';
import { handleFileUpload } from "../utils/formidable"
import EmployerService from '../services/employerService';
import { STATUS_CODES } from '../utils/statusCode';
const employerService =new EmployerService()
export const employerDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if(!userId)
        {
            res.status(STATUS_CODES.UNAUTHORIZED).json({message:"Unauthorized.UserId is required!"})
            return
        }
        const isEdit=req.query.isEdit==='true'
        const uploadResponse=await handleFileUpload(req)
        if(!uploadResponse ||!uploadResponse.fields)
        {
            res.status(STATUS_CODES.BAD_REQUEST).json({message:"Invalid form data"})
            return
        }
        const {logo}=uploadResponse.fileNames
        const data={
            companyName:uploadResponse.fields.companyName?.[0],
            website: uploadResponse.fields.website?.[0],
            location: uploadResponse.fields.location?.[0],
            employees: uploadResponse.fields.employees?.[0],
            industry: uploadResponse.fields.industry?.[0],
            dateFounded: uploadResponse.fields.dateFounded?.[0],
            logo:uploadResponse.fileNames.logo,
            document: uploadResponse.fileNames.document,
            documentType:uploadResponse.fields.documentType?.[0],
            documentNumber:uploadResponse.fields.documentNumber?.[0],
            description:uploadResponse.fields.description?.[0]
        }
        if(!userId)
        {
             res.status(STATUS_CODES.BAD_REQUEST).json({message:"User id is required"})
            return
        }
        if (!data)
        {
             res.status(STATUS_CODES.BAD_REQUEST).json({message:"No data provided for update"})
            return
        }
        const updatedUser=await employerService.updateUser(userId,data)
        res.status(STATUS_CODES.OK).json({updatedUser,success:true,isEdit:isEdit,message:isEdit?"Company details updated!":"Company details added",
            redirectTo: isEdit ? '/employerhome' :"/employerhome"
        })
    } catch (error) {
        next(error)
    }
}
export const isEmployerVerified=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const employerId=req.user?.userId
        if(!employerId)
        {
            res.status(STATUS_CODES.BAD_REQUEST).json({message:"employer id is required"})
            return
        }
        const isVerified=await employerService.isVerified(employerId)
        if(isVerified)
        {
            res.status(STATUS_CODES.OK).json({message:"isVerified"})
            return
        }
        else
        {
            res.status(STATUS_CODES.OK).json({message:"!isVerified"})
            return
        }
    } catch (error) {
        next(error)
    }
}