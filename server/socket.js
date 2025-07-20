import { Server } from "socket.io";
import 'dotenv/config';

const onlineUsers = {};  
let io = null;

export function initSocket(server) {
  
  io = new Server(server, {
    cors: {
      origin: [process.env.FRONTEND_URL, "http://localhost:3000"], 
      methods: ["GET", "POST", "PUT"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    
    socket.on("register", ({ userId, role }) => {
      
      onlineUsers[userId] = { socketId: socket.id, role: role }; 
      

      if (role) {
        socket.join(role);
      }
      if (userId) {
        socket.join(userId); 
      }
    });

    socket.on("disconnect", () => {
     
      for (const [uid, userData] of Object.entries(onlineUsers)) {
        if (userData.socketId === socket.id) { 
          delete onlineUsers[uid];
          
          break;
        }
      }
    });
  });
}

export function getIo() {
  if (!io) {
    throw new Error("Socket.io not initialized. Did you forget to call initSocket()?");
  }
  return io;
}

export function getOnlineUsers() {
  return Object.values(onlineUsers); 
}