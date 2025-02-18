import { STATUS_CODES } from './../utils/statusCode';
import { CreateReportDTO, ReportStatusDTO } from './../dtos/adminDTO';
import { NextFunction } from 'express';
import { ReportService } from '../services/ReportService';
import { TYPES } from '../types/types';
import { inject, injectable } from "inversify";
import { validateDTO } from '../dtos/validateDTO';
import { Request, Response } from 'express';
import { IReportController } from '../types/controllerinterface';

@injectable()
export class ReportController  implements IReportController
{
    constructor(@inject(TYPES.ReportService)private reportService:ReportService){}
    async createReport(req:Request,res:Response,next:NextFunction)
    {
        try {
            const {reportData}=await  validateDTO(CreateReportDTO,req.body)
        const report=await this.reportService.createReport(reportData)
        res.status(STATUS_CODES.OK).json(report);
        } catch (error) {
           next(error) 
        }
        

    }
    async getReports(req:Request,res:Response,next:NextFunction)
    {
        try {
            const reports= await this.reportService.getReports()
        res.status(STATUS_CODES.OK).json(reports)
        } catch (error) {
            next(error)
        }
        
    }
    async changeReportStatus(req:Request,res:Response,next:NextFunction)
    {
        try {
            const {reportId,newStatus}=await validateDTO(ReportStatusDTO,req.body)
            const success=await this.reportService.changeReportStatus(reportId,newStatus)
            res.status(STATUS_CODES.OK).json({success})
        } catch (error) {
            next(error);
        }
    }

}