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
      const userId = req.user?.userId;
      const messages = await this.chatService.getChat(id, userId);
      res.status(STATUS_CODES.OK).json({ messages, userId });
    } catch (error) {
      next(error);
    }
  };

  public getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Unauthorized user" });
        return;
    }
      const messages = await this.chatService.getMessagesForUser(userId);
      res.status(STATUS_CODES.OK).json(messages);
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
