import mongoose, { mongo } from "mongoose";
const notificationSchema=new mongoose.Schema({
    receipient:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'receipientModel'
    },
    receipientModel: {
        type: String,
        required: true,
        enum: ['user', 'employer']
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"senderModel"
    },
    senderModel:{
        type:String,
        required:true,
        enum: ['user', 'employer']


    },
    type:{
        type:String,
        required:true,
        enum:[
            'friend_request',
            'friend_request_accepted',
            'new_message',
            'job_application',
            'job_application_update'
        ]
    },
    content:{
        type:String,
        required:true
    },
    link:{
        type:String
    },
    read:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }

})
const Notification=mongoose.model("Notification",notificationSchema)
export default Notification