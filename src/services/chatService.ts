import { ChatRepository } from "../repositories/chatRepository";

export class ChatService
{
    private chatRepository:ChatRepository
    constructor()
    {
        this.chatRepository=new ChatRepository()
    }
    async sendMessage(data:{sender:string,receiver:string,content:string})
    {
        const {sender,receiver,content}=data
        if(!sender || !receiver || !content)
        {
            throw new Error("Fields are missing!")
        }
        return await this.chatRepository.saveMessage(data)
    }
    async getChat(user1:string,user2:string)
    {
        if(!user1||!user2)
        {
            throw new Error("Both users are required!")
        }
        return await this.chatRepository.getMessages(user1,user2)
    }
    async getMessagesForUser(userId:string)
    {
        if(!userId)
        {
            throw new Error("UserId is required!")
        }
        return await this.chatRepository.getMessagesForUser(userId)
    }
}