import { Response,Request,NextFunction } from 'express';
import { handleFileUpload } from "../utils/formidable"
import EmployerService from '../services/employerService';
const employerService =new EmployerService()

export const employerDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;
        if(!userId)
        {
            res.status(401).json({message:"Unauthorized.UserId is required!"})
            return
        }
        const isEdit=req.query.isEdit==='true'
        const uploadResponse=await handleFileUpload(req)
        if(!uploadResponse ||!uploadResponse.fields)
        {
            res.status(400).json({message:"Invalid form data"})
            return
        }
        console.log(uploadResponse)
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
             res.status(400).json({message:"User id is required"})
            return
        }
        if (!data)
        {
             res.status(400).json({message:"No data provided for update"})
            return
        }
        const updatedUser=await employerService.updateUser(userId,data)
        res.status(200).json({updatedUser,success:true,isEdit:isEdit,message:isEdit?"Company details updated!":"Company details added",
            redirectTo: isEdit ? '/employerhome' :"/employerhome"
        })
        
    } catch (error) {
        res.status(500).json({message:"an error occured during employerDetails"})
    }
}