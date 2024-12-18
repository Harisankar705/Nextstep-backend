import mongoose,{Schema} from "mongoose";
const connectionSchema=new Schema({
    sender:{type:mongoose.Schema.ObjectId,ref:"User",required:true},
    receiver:{type:mongoose.Schema.ObjectId,ref:"User",required:true},
    status:{
        type:String,
        enum:['Pending','Accepted',"Rejected"],
        default:"Pending"
    },
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
    
})
const ConnectionModel =mongoose.model("Connection",connectionSchema)
export default ConnectionModel