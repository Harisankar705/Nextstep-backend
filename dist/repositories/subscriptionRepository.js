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
exports.SubscriptionRepository = void 0;
const inversify_1 = require("inversify");
const baseRepository_1 = require("./baseRepository");
const types_1 = require("../types/types");
const mongoose_1 = require("mongoose");
let SubscriptionRepository = class SubscriptionRepository extends baseRepository_1.BaseRepository {
    constructor(subscriptionModel) {
        super(subscriptionModel);
        this.subscriptionModel = subscriptionModel;
    }
    async createSubscription(subscriptionData) {
        try {
            const subscription = new this.subscriptionModel(subscriptionData);
            return await subscription.save();
        }
        catch (error) {
            console.log(error);
            throw new Error('Error occured while creating subscription');
        }
    }
    async getSubscriptions() {
        return await this.subscriptionModel.find();
    }
    async findSubscriptionById(id) {
        return await this.subscriptionModel.findById(id);
    }
    async updateSubscription(id, updateData) {
        console.log(updateData);
        return await this.subscriptionModel.findByIdAndUpdate(id, updateData, { new: true });
    }
};
exports.SubscriptionRepository = SubscriptionRepository;
exports.SubscriptionRepository = SubscriptionRepository = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.TYPES.SubscriptionModel)),
    __metadata("design:paramtypes", [mongoose_1.Model])
], SubscriptionRepository);
