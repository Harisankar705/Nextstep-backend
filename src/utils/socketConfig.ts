import { Server, Socket } from "socket.io";
import { ChatService } from "../services/chatService";
import { TYPES } from "../types/types";
import { inject, injectable } from "inversify";
import cookie from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";
import { InteractionService } from "../services/interactionService";
const connectedUsers: { [userId: string]: string } = {};
@injectable()
export class SocketHandler {
  private chatService: ChatService;
  private userRepository: UserRepository;
  private interactionService: InteractionService;
  constructor(
    @inject(TYPES.ChatService) chatService: ChatService,
    @inject(TYPES.UserRepository) userRepository: UserRepository,
    @inject(TYPES.InteractionService)
    interactionService: InteractionService
  ) {
    this.chatService = chatService;
    this.userRepository = userRepository;
    this.interactionService = interactionService;
  }
  public configure(io: Server) {
    io.use(async (socket: Socket, next) => {
      try {
        const cookieHeader = socket.handshake.headers.cookie;
        if (!cookieHeader) {
          return next(new Error("No authentication cookies"));
        }
        const cookies = cookie.parse(cookieHeader);
        const token = cookies.employerAccessToken || cookies.userAccessToken;
        if (!token) {
          return next(new Error("No token found in cookies"));
        }
        const decoded = jwt.verify(
          token,
          process.env.ACCESS_TOKEN as string
        ) as JwtPayload;
        const role = decoded.role;
        const userData = await this.userRepository.findById(
          decoded.userId,
          role
        );
        if (!userData || userData.status === "Inactive") {
          return next(new Error("Authentication restricted"));
        }
        socket.data.user = {
          userId: decoded.userId,
          role: role,
        };
        connectedUsers[decoded.userId] = socket.id;
        next();
      } catch (error) {
        return next(new Error("Authentication error"));
      }
    });
  io.on("connection", (socket) => {
    const userId = socket.data.user.userId;
    socket.on("join", (roomId: string) => {
      if (!roomId) {
        throw new Error(`Invalid room ID for user ${userId}`);
      }
      socket.join(roomId);
    });
    socket.on(
      "sendMessage",
      async (data: {
        receiverId: string;
        content: string;
        file?: { data: string; name: string; type: string };
      }) => {
        try {
          if (!data.receiverId) {
            throw new Error("Invalid message data");
          }
          const senderId = socket.data.user.userId;
          const message = await this.chatService.sendMessage({
            sender: senderId,
            receiverId: data.receiverId,
            content: data.content,
            status: "sent",
            file: data.file,
          });
          io.to(senderId)
            .to(data.receiverId)
            .emit("receiveMessage", {
              ...message.toObject(),
              status: "delivered",
              file: data.file
                ? {
                    data: data.file.data,
                    name: data.file.name,
                    type: data.file.type,
                  }
                : null,
            });
          socket.emit("messageSent", {
            messageId: message._id,
            status: "sent",
          });
        } catch (error: any) {
          socket.emit("messageError", {
            message: "Failed to send message",
            error: error.message,
          });
        }
      }
    );
    socket.on(
      "messageStatus",
      async (data: {
        messageIds: string[];
        status: "sent" | "delivered" | "seen";
        receiverId: string;
      }) => {
        try {
          if (!data.messageIds || data.messageIds.length === 0) {
            throw new Error("No message IDs provided");
          }
          const updatedMessages = await Promise.all(
            data.messageIds.map(async (messageId) => {
              return await this.chatService.updateMessageStatus(
                messageId,
                data.status
              );
            })
          );
          io.to(socket.data.user.userId)
            .to(data.receiverId)
            .emit("messageStatusUpdate", {
              messageId: data.messageIds[0],
              status: data.status,
              timestamp: new Date().toISOString(),
            });
        } catch (error: any) {
          socket.emit("messageError", {
            message: "Failed to update message status",
            error: error.message,
          });
        }
      }
    );
    socket.on(
      "deleteMessage",
      async (data: {
        messageId: string;
        senderId: string;
        receiverId: string;
      }) => {
        try {
          const message = await this.chatService.findMessageById(data.messageId);
          if (!message) {
            throw new Error("message not  found");
          }
          if (!data.messageId || !data.senderId || !data.receiverId) {
            throw new Error("Invalid deletion request parameters");
          }
          if (data.receiverId !== socket.data.user.userId) {
            throw new Error("Unauthorized message deletion attempt");
          }
          await this.chatService.deleteMessage(data.messageId);
          io.to(data.senderId)
            .to(data.receiverId)
            .emit("messageDeleted", {
              messageId: data.messageId,
              deleteBy: data.senderId,
            });
        } catch (error: any) {
          socket.emit("messageError", {
            message: "Failed to delete",
            error: error.message,
          });
        }
      }
    );
    socket.on('videoCallOffer', (data: {
      senderId: string;
      receiverId: string;
      offer: RTCSessionDescriptionInit;
    }) => {
      try {
        const receiverSocketId = connectedUsers[data.receiverId];
        if (!receiverSocketId) {
          socket.emit('callError', { message: 'Receiver is offline' });
          return;
        }
        io.to(receiverSocketId).emit('videoCallOffer', {
          senderId: data.senderId,
          receiverId: data.receiverId,
          offer: data.offer
        });
      } catch (error) {
        socket.emit('callError', { message: 'Failed to process video call offer' });
      }
    });
    socket.on('videoCallAnswer', (data: {
      senderId: string;
      receiverId: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      try {
        const callerSocketId = connectedUsers[data.receiverId];
        if (!callerSocketId) {
          socket.emit('callError', { message: 'Caller is no longer online' });
          return;
        }
        io.to(callerSocketId).emit('videoCallAnswer', {
          senderId: data.senderId,
          answer: data.answer
        });
      } catch (error) {
        socket.emit('callError', { message: 'Failed to process video call answer' });
      }
    });
    socket.on('newIceCandidate', (data: {
      senderId: string;
      receiverId: string;
      candidate: RTCIceCandidate;
    }) => {
      try {
        const recipientSocketId = connectedUsers[data.receiverId];
        if (!recipientSocketId) {
          socket.emit('callError', { message: 'Recipient is no longer online' });
          return;
        }
        io.to(recipientSocketId).emit('newICECandidate', {
          senderId: data.senderId,
          candidate: data.candidate
        });
      } catch (error) {
        socket.emit('callError', { message: 'Failed to process ICE candidate' });
      }
    });
    socket.on('videoCallHangUp', (data: {
      senderId: string;
      receiverId: string;
    }) => {
      try {
        if (!data.senderId || !data.receiverId) {
          console.error('Invalid videoCallHangUp data:', data);
          return;
        }
        const recipientSocketId = connectedUsers[data.receiverId];
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('videoCallEnded', {
            senderId: data.senderId,
            timestamp: new Date().toISOString()
          });
          console.log(`Video call hang up: 
            Sender: ${data.senderId}, 
            Recipient: ${data.receiverId}`);
        } else {
          console.warn(`Recipient ${data.receiverId} not found in connected users`);
        }
      } catch (error) {
        console.error('Error in videoCallHangUp:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          data
        });
      }
    });
    socket.on('likePost',async({userId,recipient,postId,content,link})=>{
      try {
        console.log("IN likepost")
        const updatedPost=await this.interactionService.likePost(userId,postId)
        io.to(recipient).emit('newNotification',{
          content,
          link,
          postId,
          userId
        })
      } catch (error) {
        throw new Error
      }
    })
    socket.on('commentPost',async({userId,postId,comment})=>{
      try {
        const newComment=await this.interactionService.commentOnPost(userId,postId,comment)
        const userIdString = newComment.userId.toString();
        io.to(userIdString).emit('postCommented',{postId,userId,newComment})
      } catch (error) {
        throw new Error
      }
    })
    socket.on("disconnect", () => {
      delete connectedUsers[userId]
      try {
        socket.rooms.forEach((room) => {
          socket.leave(room);
        });
      } catch (error) {
        throw error
      }
    });
  });
};
}