import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ReportRepository } from "../repositories/reportRepository";
import { IReport, Reason } from "../types/authTypes";
import { IReportService } from "../types/serviceInterface";

@injectable()
export class ReportService implements IReportService
{
    constructor(@inject(TYPES.ReportRepository)private reportRepository:ReportRepository){}
    async createReport(reportData:IReport)
    {
        const newReport=await this.reportRepository.createReport(reportData)
        return newReport
    }
    async getReports(filter={})
    {
        return await this.reportRepository.getReports(filter)
    }
    async changeReportStatus(reportId:string,newStatus:Reason)
    {
        const result= await this.reportRepository.changeStatus(reportId,newStatus)
        return result?true:false
    }
}