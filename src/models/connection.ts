import mongoose,{Schema} from "mongoose";
import { ConnectionStatus, IConnection } from "../types/authTypes";
const connectionSchema=new Schema<IConnection>({
    followerId:{type:mongoose.Schema.ObjectId,ref:"User",required:true},
    followingId:{type:mongoose.Schema.ObjectId,ref:"User",required:true},
    isFollowBack:{type:Boolean,default:false},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now},
    status:{type:String,enum:ConnectionStatus,required:true}

    
})
const ConnectionModel =mongoose.model("Connection",connectionSchema)
export default ConnectionModel