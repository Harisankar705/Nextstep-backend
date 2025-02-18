import mongoose, { Schema } from "mongoose";
import { INotification } from "../types/authTypes";
const notificationSchema=new Schema<INotification>({
    recipientId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
    },
    senderModel:{
        type:String,
        required:true,
        enum: ['User', 'Employer']
    },
    type:{
        type:String,
        required:true,
        enum:[
            'post_like',
            'post_comment',
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
