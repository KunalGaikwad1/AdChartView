// src/lib/socketServer.ts
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";

let io: IOServer | null = null;

export const initSocket = (server: HTTPServer) => {
  if (io) {
    console.log("⚙️ Socket.io already initialized");
    return io;
  }

  io = new IOServer(server, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    socket.on("join", (userId) => {
      if (!userId) return;
      try {
        socket.join(userId.toString());
        console.log(`Socket ${socket.id} joined room ${userId}`);
      } catch (err) {
        console.error("Socket join error:", err);
      }
    });
    socket.on("leave", (userId) => {
      if (!userId) return;
      try {
        socket.leave(userId.toString());
      } catch (err) {
        console.error("Socket leave error:", err);
      }
    });
  });

  console.log("✅ Socket.io initialized!");
  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn("⚠️ Socket.io not initialized, skipping real-time emit.");
    return null;
  }
  return io;
};
