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
    console.log("✅ New client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id);
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
