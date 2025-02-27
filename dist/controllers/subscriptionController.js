"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const inversify_1 = require("inversify");
const validateDTO_1 = require("../dtos/validateDTO");
const adminDTO_1 = require("../dtos/adminDTO");
const statusCode_1 = require("../utils/statusCode");
const types_1 = require("../types/types");
const subscriptionService_1 = require("../services/subscriptionService");
let SubscriptionController = class SubscriptionController {
    constructor(subscriptionService) {
        this.subscriptionService = subscriptionService;
    }
    async createSubscription(req, res, next) {
        try {
            console.log(req.body);
            const subscriptionData = await (0, validateDTO_1.validateDTO)(adminDTO_1.CreateSubscriptionDTO, req.body);
            const subscription = await this.subscriptionService.createSubscription(subscriptionData);
            res.status(statusCode_1.STATUS_CODES.OK).json(subscription);
        }
        catch (error) {
            next(error);
        }
    }
    async getSubscriptions(req, res, next) {
        try {
            const subscriptions = await this.subscriptionService.getSubscriptions();
            res.status(statusCode_1.STATUS_CODES.OK).json(subscriptions);
        }
        catch (error) {
            next(error);
        }
    }
    async getSubscriptionsById(req, res, next) {
        try {
            const { id } = req.params;
            const subscriptions = await this.subscriptionService.getSubscriptionById(id);
            res.status(statusCode_1.STATUS_CODES.OK).json(subscriptions);
        }
        catch (error) {
            next(error);
        }
    }
    async editSubscription(req, res, next) {
        try {
            console.log("IN EDIT SUBSCRIPTION");
            const { id } = req.params;
            const { _id, toggleStatus, ...plan } = req.body;
            console.log("TOGGLESTATUS", plan);
            if (toggleStatus) {
                await this.subscriptionService.changeSubscriptionStatus(id);
            }
            if (Object.keys(plan).length > 0) {
                await this.subscriptionService.editSubscriptionPlan(id, plan);
            }
            res.status(statusCode_1.STATUS_CODES.CREATED).send({ message: "Subscription updated successfully!" });
        }
        catch (error) {
            next(error);
        }
    }
};
exports.SubscriptionController = SubscriptionController;
exports.SubscriptionController = SubscriptionController = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.SubscriptionService)),
    __metadata("design:paramtypes", [subscriptionService_1.SubscriptionService])
], SubscriptionController);
