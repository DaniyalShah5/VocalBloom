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
      console.log(`User ${userId} (${role}) registered with socket ${socket.id}`);
      console.log('Current online users:', onlineUsers);

      if (role) {
        socket.join(role);
        console.log(`Joined room: ${role}`);
      }
      if (userId) {
        socket.join(userId); 
        console.log(`Joined room: ${userId}`);
      }
    });

    socket.on("disconnect", () => {
     
      console.log(`Socket disconnected: ${socket.id}`);
      for (const [uid, userData] of Object.entries(onlineUsers)) {
        if (userData.socketId === socket.id) { 
          delete onlineUsers[uid];
          console.log(`Removed user ${uid} from onlineUsers.`);
          break;
        }
      }
      console.log('Current online users after disconnect:', onlineUsers);
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