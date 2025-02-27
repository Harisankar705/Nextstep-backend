import { inject, injectable } from "inversify";
import { ISubscription } from "../types/authTypes";
import { TYPES } from "../types/types";
import { ISubscriptionRepository } from '../types/repositoryInterface';
import { ISubscriptionService } from '../types/serviceInterface';

@injectable()
export class SubscriptionService implements ISubscriptionService
{
    constructor(@inject(TYPES.SubscriptionRepository)private subscriptionRepository:ISubscriptionRepository){}
    async createSubscription(subscriptionData:ISubscription)
    {
        return this.subscriptionRepository.createSubscription(subscriptionData)
    }
    async getSubscriptions():Promise<ISubscription[]>
    {
        return this.subscriptionRepository.getSubscriptions()
    }   
    async getSubscriptionById(id:string):Promise<ISubscription|null>
    {
        return this.subscriptionRepository.findSubscriptionById(id)
    }
    async changeSubscriptionStatus(id:string){
        
        const subscription=await this.subscriptionRepository.findSubscriptionById(id)
        if(!subscription)
        {
            throw new Error('subscription not found')
        }
        console.log('subscription',subscription)
        const newStatus=subscription.status==='active'?'inactive':'active'
        console.log('123',newStatus)
        return await this.subscriptionRepository.updateSubscription(id,{status:newStatus})
    }
    async editSubscriptionPlan(id:string,plan:Partial<ISubscription>)
    {
        const subscription=await this.subscriptionRepository.findSubscriptionById(id)
        if(!subscription)
        {
            throw new Error("subscription not found!")
        }
        console.log('123',subscription)
        return await this.subscriptionRepository.updateSubscription(id,plan)
    }
}