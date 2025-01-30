import { chatModel } from "../models/chat"
export class ChatRepository
{
    async saveMessage(data:Record<string,any>)
    {
        return await chatModel.create(data)
    }
    async getMessages(id:string,userId:string)
    {
        return await chatModel.find({
            $or:[
                {senderId:id,receiverId:userId},
                {senderId:userId,receiverId:id}
            ],
        }).sort({timeStamp:1})
    }
    async updateMessageStatus(messageId:string,status:'sent'|'delivered'|'seen')
    {
        return await chatModel.findByIdAndUpdate(messageId,{
            status,
            ...(status==='delivered' && {deliveredAt:new Date()}),
            ...(status==='seen' && {seenAt:new Date()})
        },
        {new:true}
    )
    }
    async getMessagesForUser(userId:string)
    {
        return await chatModel.find({
            $or:[
                {sender:userId},{receiver:userId},
            ]
        }).sort({timeStamp:-1})
    }
    async deleteMessageById(messageId:string)
    {
        try {
            return await chatModel.findByIdAndDelete(messageId)
        } catch (error) {
            throw new Error("Error deleting Message")
        }
    }
}