import { Request, Response } from "express"
import { ChatService } from "../services/chatService"
import { S3Client, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
const chatService = new ChatService();


// export const sendMessage=async(req:Request,res:Response)=>{
// try {
//     const sender=req.user?.userId
//     const {receiverId,content}=req.body.messageData 
//     console.log(req.body)
//     if(!sender||!receiverId||!content)
//     {
//         res.status(400).json({message:"All fields are required!"})
//     }
//     // const message=await chatService.sendMessage({sender,receiverId,content})
//     res.status(200).json(message)
// } catch (error) {
//     console.log('error',error)
//     res.status(500).json({error:error})
// }
// }
export const getChat=async(req:Request,res:Response)=>{
    try {
        const {id}=req.params
        const userId=req.user?.userId
        const messages=await chatService.getChat(id,userId)
        res.status(201).json({messages,userId})
    } catch (error) {
        res.status(500).json({error:error})
    }
}
export const getMessages=async(req:Request,res:Response)=>{
    try {
        const userId=req.user?.userId
        console.log('userid',userId)
        const messages=await chatService.getMessagesForUser(userId)
        console.log('messages',messages)
        res.status(200).json(messages)
    } catch (error) {
        res.status(500).json(error)
    }
}

export const getURL = async (req: Request, res: Response) => {
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'Missing URL' });
      }
  
      const urlParts = new URL(url);
      const bucket = urlParts.hostname.split('.')[0];
      const key = decodeURIComponent(urlParts.pathname.substring(1));
  
      // Prepare the input for the GetObjectCommand
      const getObjectParams: GetObjectCommandInput = {
        Bucket: bucket,
        Key: key,
      };
  
      // Create a GetObjectCommand
      const command = new GetObjectCommand(getObjectParams);
  
      // Generate the signed URL
      const signedURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // 1 hour expiry
  
      return res.status(200).json({ secureURL: signedURL });
    } catch (error) {
      console.error('Error generating signed URL:', error);
      return res.status(500).json({ error: 'Failed to generate signed URL' });
    }
  };
