import mongoose, {Schema, Types} from 'mongoose'
import { IChatMessage } from '../types/authTypes'
const ChatSchema=new Schema<IChatMessage>({
    senderId:{type:Schema.Types.ObjectId,ref:"User",required:true},
    receiverId:{type:Schema.Types.ObjectId,ref:"Employer",required:true},
    content:{type:String,required:true},
    type:{
        type:String,
        enum:['text','image','document'],
        default:'text'
    },
    timestamp:{type:Date,default:Date.now},
    status:{type:String,enum:['sent','delivered','read'],
        default:'sent'
    },
    seenAt:{type:Date,default:null},
    deliveredAt:{type:Date,default:null},
    file:{
            name:{type:String},
            type:{type:String},
            url:{type:String}
    },   
    isDeleted:{type:Boolean,default:false}
})
export const ChatModel = mongoose.model("Chat", ChatSchema)