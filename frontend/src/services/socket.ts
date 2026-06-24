import { io, Socket } from "socket.io-client";

// En dev : variable absente → connexion relative (proxy Vite)
// En prod : VITE_BACKEND_URL=https://xxx.onrender.com
const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND || "/", {
      path: "/socket.io",
      transports: ["websocket"],
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
}
