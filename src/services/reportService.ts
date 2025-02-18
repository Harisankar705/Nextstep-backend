import { inject, injectable } from "inversify";
import { TYPES } from "../types/types";
import { ReportRepository } from "../repositories/reportRepository";
import { IEmployer, IReport, IReportData, IUser, Reason } from "../types/authTypes";
import { IReportService } from "../types/serviceInterface";
import { getModel } from "../utils/modelUtil";
import { Model } from "mongoose";

@injectable()
export class ReportService implements IReportService
{
    constructor(@inject(TYPES.ReportRepository)private reportRepository:ReportRepository){}
    async createReport(reportData:IReportData,userId:string)
    {
        const model=await getModel(reportData.role) as Model<IUser|IEmployer>
        const reporter=await model.findById(userId)
        if(!reporter)
        {
            throw new Error("Reporter not found")
        }
        const newReport=await this.reportRepository.createReport(reportData,model,reporter._id)
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