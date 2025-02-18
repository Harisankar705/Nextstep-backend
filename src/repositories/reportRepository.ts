import { Model } from "mongoose";
import { IReport, Reason } from "../types/authTypes";
import { TYPES } from "../types/types";
import { BaseRepository } from "./baseRepository";
import { inject, injectable } from "inversify";
import { ReportModel } from "../models/report";
import { IReportRepository } from "../types/repositoryInterface";
@injectable()
export class ReportRepository extends BaseRepository<IReport & Document> implements IReportRepository
{
 constructor(@inject(TYPES.ReportModel)private reportModel:Model<IReport & Document>)
 {
    super(reportModel)
 }
 async createReport(reportData:IReport)
 {
    try {
        const newReport=new this.reportModel(reportData)
        return await newReport.save()
    } catch (error) {
            throw error
    }   
 }
 async changeStatus(reportId:string,newStatus:Reason)
 {
    try {
        const updatedReport= await ReportModel.findByIdAndUpdate(reportId,{status:newStatus},{new:true})
        return updatedReport!==null
    } catch (error) {
        throw new  Error("Error occured while changing report status")
    }
 }
 async getReports(filter={})
 {
    try {
        return await ReportModel.find(filter)
        .populate('post','title content')
        .populate('reporter','firstName lastName companyName')
        .sort({createdAt:-1})
    } catch (error) {
        throw new  Error("Error occured while fetching Reports!")
    }
 }
}