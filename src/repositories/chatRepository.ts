import { timeStamp } from "console"
import { chatModel } from "../models/chat"

export class ChatRepository
{
    async saveMessage(data:Record<string,any>)
    {
        return await chatModel.create(data)
    }
    async getMessages(userId:string,contactId:string)
    {
        return await chatModel.find({
            $or:[
                {senderId:userId,receiverId:contactId},
                {senderId:contactId,receiverId:userId}
            ],
        }).sort({timeStamp:1})
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