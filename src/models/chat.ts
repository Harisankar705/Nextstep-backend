import mongoose, {Schema, Types} from 'mongoose'
interface ChatMessage{
    _id:Types.ObjectId;
    senderId:Types.ObjectId,
    receiverId:Types.ObjectId,
    content:string,
    type:'text'|'image'|'document',
    timeStamp:Date,
    status:"sent"|"delivered"|'read',
    fileUrl?:string,
    senderRole:"User"|'Employer';
    receiverRole:"User"|'Employer'
    isDeleted:boolean
}
const ChatSchema=new Schema<ChatMessage>({
    senderId:{type:Schema.Types.ObjectId,ref:"User",required:true},
    receiverId:{type:Schema.Types.ObjectId,ref:"Employer",required:true},
    content:{type:String,required:true},
    type:{
        type:String,
        enum:['text','image','document'],
        default:'text'
    },
    timeStamp:{type:Date,default:Date.now},
    status:{type:String,enum:['sent','delivered','read'],
        default:'sent'

    },
    fileUrl:{type:String},
    senderRole:{type:String,enum:["User","Employer"],required:true},
    receiverRole:{type:String,enum:["User","Employer"],required:true},
    isDeleted:{type:Boolean,default:false}
})
export const chatModel = mongoose.model("Chat", ChatSchema)