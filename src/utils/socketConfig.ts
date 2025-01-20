import { Server, Socket } from "socket.io";
import { ChatService } from "../services/chatService";
import cookie from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserRepository } from "../repositories/userRepository";

const chatService = new ChatService();
export const socketConfig = (io: Server) => {
  console.log("Socket server initialized");

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

      const userRepository = new UserRepository();
      const role = decoded.role;
      const userData = await userRepository.findById(decoded.userId, role);

      if (!userData || userData.status === "Inactive") {
        return next(new Error("Authentication restricted"));
      }

      socket.data.user = {
        userId: decoded.userId,
        role: role,
      };

      next();
    } catch (error) {
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("New connection:", socket.id);
    const userId = socket.data.user.userId;

    socket.on("join", (roomId: string) => {
      if (!roomId) {
        console.warn(`Invalid room ID for user ${userId}`);
        return;
      }

      socket.join(roomId);
      console.log(`User ${userId} joined room: ${roomId}`);
    });

    socket.on(
      "sendMessage",
      async (data: { receiverId: string; content: string,file?:{data:string;name:string,type:string}}) => {
        try {
          console.log("data", data);

          if (!data.receiverId || !data.content) {
            throw new Error("Invalid message data");
          }

          const senderId = socket.data.user.userId;
        
            
             
             
            
           
          
          const message = await chatService.sendMessage({
            sender: senderId,
            receiverId: data.receiverId,
            content: data.content,
            status: "sent",
            file:data.file
          });
        

          
          io.to(senderId)
            .to(data.receiverId)
            .emit("receiveMessage", {
              ...message.toObject(),
              status: "delivered",
              file:data.file?{
                data:data.file.data,
                name:data.file.name,
                type:data.file.type,
              }:null
            });

          socket.emit("messageSent", {
            messageId: message._id,
            status: "sent",
          });

        
        } catch (error: any) {
          console.error("Message sending error:", error);
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

          console.log(
            `Updating message status: ${data.messageIds} to ${data.status}`
          );

          const updatedMessages = await Promise.all(
            data.messageIds.map(async (messageId) => {
              return await chatService.updateMessageStatus(
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

          console.log(
            `Message status updated successfully: ${data.messageIds}`
          );
        } catch (error: any) {
          console.error("Status update error:", error);
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
          console.log(data);
          const message = await chatService.findMessageById(data.messageId);
          if (!message) {
            throw new Error("message not  found");
          }
          if (!data.messageId || !data.senderId || !data.receiverId) {
            throw new Error("Invalid deletion request parameters");
          }
          console.log("socket", socket.data.user.userId);
          if (data.receiverId !== socket.data.user.userId) {
            throw new Error("Unauthorized message deletion attempt");
          }
          await chatService.deleteMessage(data.messageId);
          io.to(data.senderId).to(data.receiverId).emit("messageDeleted", {
            messageId: data.messageId,
            deleteBy: data.senderId,
          });
          console.log(`${data.messageId} deleted by ${data.senderId}`);
        } catch (error: any) {
          console.error("message deletiong", error);
          socket.emit("messageError", {
            message: "Failed to delete",
            error: error.message,
          });
        }
      }
    );

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);

      try {
        socket.rooms.forEach((room) => {
          socket.leave(room);
        });
      } catch (error) {
        console.error("Disconnect cleanup error:", error);
      }
    });
  });
};
