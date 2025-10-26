import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // create socket connection
    const socketInstance: Socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000"
    );

    setSocket(socketInstance);

    // cleanup function
    return () => {
      if (socketInstance.connected) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return socket;
}
