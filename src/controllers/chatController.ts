import { ChatService } from './../services/chatService';
import { NextFunction, Request, Response } from "express";
import { S3Client, GetObjectCommand, GetObjectCommandInput } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { STATUS_CODES } from "../utils/statusCode";
import { IChatController } from "../types/controllerinterface";
import { inject } from "inversify";
import { TYPES } from '../types/types';
import { GetChatDTO, GetURLDTO } from '../dtos/userDTO';
import { validateDTO } from '../dtos/validateDTO';

export class ChatController implements IChatController {
  

  constructor(@inject(TYPES.ChatService)private chatService:ChatService,@inject(TYPES.S3Client)private s3Client:S3Client) {}

  public getChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.userId;
      console.log('in get chat')
      const messages = await this.chatService.getChat(id, currentUserId);
      console.log("currentUserId",currentUserId)
      res.status(STATUS_CODES.OK).json({ messages, currentUserId });
    } catch (error) {
      next(error);
    }
  };

  public getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUserId = req.user?.userId;
      console.log("USERID",currentUserId)
      
      const messages = await this.chatService.getMessagesForUser(currentUserId);
      console.log("!!!!!!!",messages)
       res.status(STATUS_CODES.OK).json({ messages, currentUserId});
       return
    } catch (error) {
      next(error);
    }
  };

  public getURL = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const getURLDTO=await validateDTO(GetURLDTO,req.body)
      

      const urlParts = new URL(getURLDTO.url);
      const bucket = urlParts.hostname.split(".")[0];
      const key = decodeURIComponent(urlParts.pathname.substring(1));

      const getObjectParams: GetObjectCommandInput = {
        Bucket: bucket,
        Key: key,
      };

      const command = new GetObjectCommand(getObjectParams);
      const signedURL = await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });

      res.status(STATUS_CODES.OK).json({ secureURL: signedURL });
    } catch (error) {
      next(error);
    }
  };
}
