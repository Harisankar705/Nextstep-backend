import mongoose, {Schema, Types} from 'mongoose'
interface ChatMessage{
    _id:Types.ObjectId;
    senderId:Types.ObjectId,
    receiverId:Types.ObjectId,
    content:string,
    type:'text'|'image'|'document',
    timestamp:Date,
    file?:{
        
            name:string
            type:string
            url:string
        
    }|null
    senderRole:"User"|'Employer';
    receiverRole:"User"|'Employer'
    isDeleted:boolean,
    status:'sent'|'delivered'|'read',
    seenAt?:Date,
    deliveredAt?:Date
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
     senderRole:{type:String,enum:["User","Employer"]},
    receiverRole:{type:String,enum:["User","Employer"]},
    isDeleted:{type:Boolean,default:false}
})
export const chatModel = mongoose.model("Chat", ChatSchema)