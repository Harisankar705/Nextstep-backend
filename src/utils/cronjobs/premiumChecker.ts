import  cron  from 'node-cron';
import UserModel from '../../models/User';
cron.schedule('0 0 * * *',async()=>{
try {
    const expiredUsers=await UserModel.find({isPremium:true,premiumExpiry:{$lt:new Date()}})
    if(expiredUsers.length>0)
    {
        await UserModel.updateMany({_id:{$in:expiredUsers.map(user=>user._id)}},{$set:{isPremium:false,currentPlan:null}})
        console.log(`Updated ${expiredUsers.length} users to non-premium.`);

    }

} catch (error) {
    console.error("Error occured while doing premium cron job!")
}
})