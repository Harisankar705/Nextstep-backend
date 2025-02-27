import {  inject, injectable } from "inversify";
import { BaseRepository } from "./baseRepository";
import { ISubscription, ISubscriptionDocument } from "../types/authTypes";
import { TYPES } from "../types/types";
import { Model } from "mongoose";
import { ISubscriptionRepository } from "../types/repositoryInterface";

@injectable()
export class SubscriptionRepository extends BaseRepository<ISubscriptionDocument & Document> implements ISubscriptionRepository{
    constructor(@inject(TYPES.SubscriptionModel)private subscriptionModel:Model<ISubscriptionDocument & Document>)
    {
        super(subscriptionModel)
    }
    async createSubscription(subscriptionData:ISubscription)
    {
        try {
            const subscription=new this.subscriptionModel(subscriptionData)
            return await subscription.save()
        } catch (error) {
            console.log(error)
            throw new Error('Error occured while creating subscription')
        }
    }
    async getSubscriptions():Promise<(ISubscriptionDocument & Document)[]>
    {
        return await this.subscriptionModel.find()
    }
    async findSubscriptionById(id:string):Promise<ISubscription|null>{
        return await this.subscriptionModel.findById(id)
    }
    async updateSubscription(id:string,updateData:Partial<ISubscription>)
    {
        console.log(updateData)
        return await this.subscriptionModel.findByIdAndUpdate(id,updateData,{new:true})
    }

}