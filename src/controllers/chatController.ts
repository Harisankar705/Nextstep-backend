import { NextFunction, Request, Response } from "express"
import { ChatService } from "../services/chatService"
import { S3Client, GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { STATUS_CODES } from "../utils/statusCode";
const chatService = new ChatService();
export const getChat=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const {id}=req.params
        const userId=req.user?.userId
        const messages=await chatService.getChat(id,userId)
        res.status(STATUS_CODES.CREATED).json({messages,userId})
    } catch (error) {
      next(error)
    }
}
export const getMessages=async(req:Request,res:Response,next:NextFunction)=>{
    try {
        const userId=req.user?.userId
        const messages=await chatService.getMessagesForUser(userId)
        res.status(STATUS_CODES.OK).json(messages)
    } catch (error) {
      next(error)    }
}
export const getURL = async (req: Request, res: Response,next:NextFunction) => {
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
         res.status(STATUS_CODES.BAD_REQUEST).json({ error: 'Missing URL' });
         return
      }
      const urlParts = new URL(url);
      const bucket = urlParts.hostname.split('.')[0];
      const key = decodeURIComponent(urlParts.pathname.substring(1));
      const getObjectParams: GetObjectCommandInput = {
        Bucket: bucket,
        Key: key,
      };
      const command = new GetObjectCommand(getObjectParams);
      const signedURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); 
       res.status(STATUS_CODES.OK).json({ secureURL: signedURL });
       return
    } catch (error) {
      next(error)
    }
  };
