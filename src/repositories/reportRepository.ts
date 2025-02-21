import { Model } from "mongoose";
import { IEmployer, IPosts, IReport, IReportData, IUser, Reason } from "../types/authTypes";
import { TYPES } from "../types/types";
import { BaseRepository } from "./baseRepository";
import { inject, injectable } from "inversify";
import { ReportModel } from "../models/report";
import { IReportRepository } from "../types/repositoryInterface";
import { ObjectId } from "mongodb";
import { container } from "../utils/inversifyContainer";
import { EmailService } from "../utils/emailService";
import { getModel } from "../utils/modelUtil";
@injectable()
export class ReportRepository extends BaseRepository<IReport & Document> implements IReportRepository
{
 constructor(@inject(TYPES.ReportModel)private reportModel:Model<IReport & Document>,@inject(TYPES.PostModel)private postModel:Model<IPosts & Document>)
 {
    super(reportModel)
 }
 async createReport(reportData: IReportData, model: Model<IUser|IEmployer>,reporterId:string|ObjectId): Promise<IReport> {
    {
    try {
        const post=await this.postModel.findById(reportData.postId)
        console.log("POST",post)
        if (!post) {
            throw new Error('Post not found');
        }

        const postOwnerModel=await getModel(post?.userType) as Model<IUser|IEmployer>
        const postOwner=await postOwnerModel.findById(post.userId)
        if (!postOwner) {
            throw new Error('Post owner not found!');
        }
        const postOwnerEmail=postOwner.email
        const user=postOwner as IUser


        const subject="Your post has been reported!"
        const text=`Hello,${user.firstName} Your post titled as ${post?.text} has been reported for the following reason ${reportData.reason}
        Post Details:
        -Content:${post?.text}
        -Created At:${post?.createdAt}
        -Report Reason:${reportData.reason}

        Please review your post and take necessary actions or else necessary actions will be taken from Nextstep's side
        Thank You
        Team Nextstep`
        const emailService=container.get<EmailService>(TYPES.EmailService)
        await emailService.sendEmail(postOwnerEmail,subject,text)

        const newReport=new this.reportModel({
            post:reportData.postId,
            reporter:reporterId,
            reporterModel:model.modelName,
            reason:reportData.reason,
            description:reportData.description||'',
            createdAt:new Date(),
            status:"pending"
        })
        return await newReport.save()
    } catch (error) {
            throw error
    }   
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
        .populate('post','text image createdAt  ')
        .populate('reporter','firstName lastName companyName profilePicture')
        .sort({createdAt:-1})
    } catch (error) {
        console.log('error',error)
        throw new  Error("Error occured while fetching Reports!")
    }
 }
}