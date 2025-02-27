import { NextFunction, Request, Response } from "express";
import { inject, injectable } from "inversify";
import { validateDTO } from "../dtos/validateDTO";
import { CreateSubscriptionDTO } from "../dtos/adminDTO";
import { STATUS_CODES } from "../utils/statusCode";
import { TYPES } from "../types/types";
import { SubscriptionService } from "../services/subscriptionService";
import { ISubscriptionController } from "../types/controllerinterface";

@injectable()
export class SubscriptionController implements ISubscriptionController
{
    constructor(@inject(TYPES.SubscriptionService)private subscriptionService:SubscriptionService)
    {

    }
    async createSubscription(req:Request,res:Response,next:NextFunction){
        try {
            console.log(req.body)
            const subscriptionData=await validateDTO(CreateSubscriptionDTO,req.body)
            const subscription=await this.subscriptionService.createSubscription(subscriptionData)
            res.status(STATUS_CODES.OK).json(subscription)
        } catch (error) {
            next(error)
        }
    }
    async getSubscriptions(req:Request,res:Response,next:NextFunction)
    {
        try {   
            const subscriptions=await this.subscriptionService.getSubscriptions()
            res.status(STATUS_CODES.OK).json(subscriptions)
        } catch (error) {
            next(error)
        }
       
    }
    async getSubscriptionsById(req:Request,res:Response,next:NextFunction)
    {
        try {   
            const {id}=req.params
            const subscriptions=await this.subscriptionService.getSubscriptionById(id)
            res.status(STATUS_CODES.OK).json(subscriptions)
        } catch (error) {
            next(error)
        }
       
    }
    async editSubscription(req:Request,res:Response,next:NextFunction)
    {
        try {
            console.log("IN EDIT SUBSCRIPTION")
            const {id}=req.params
            const {_id,toggleStatus,...plan}=req.body    
            console.log("TOGGLESTATUS",plan)
            if(toggleStatus)
            {
                await this.subscriptionService.changeSubscriptionStatus(id)
            }
            if(Object.keys(plan).length>0)
            {
                await this.subscriptionService.editSubscriptionPlan(id,plan)
            }
            res.status(STATUS_CODES.CREATED).send({message:"Subscription updated successfully!"})
        } catch (error) {
            next(error)

        }
    }
}