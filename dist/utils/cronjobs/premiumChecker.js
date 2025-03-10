"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const User_1 = __importDefault(require("../../models/User"));
node_cron_1.default.schedule('0 0 * * *', async () => {
    try {
        const expiredUsers = await User_1.default.find({ isPremium: true, premiumExpiry: { $lt: new Date() } });
        if (expiredUsers.length > 0) {
            await User_1.default.updateMany({ _id: { $in: expiredUsers.map(user => user._id) } }, { $set: { isPremium: false, currentPlan: null } });
            console.log(`Updated ${expiredUsers.length} users to non-premium.`);
        }
    }
    catch (error) {
        console.error("Error occured while doing premium cron job!");
    }
});
