import { io, Socket } from "socket.io-client";

// En dev : variable absente → WebSocket via proxy Vite
// En prod : VITE_BACKEND_URL défini → polling HTTP (Render ne supporte pas l'upgrade WS)
const BACKEND = import.meta.env.VITE_BACKEND_URL ?? "";
const TRANSPORTS = BACKEND ? ["polling"] : ["websocket"];

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND || "/", {
      path: "/socket.io",
      transports: TRANSPORTS,
      reconnectionDelay: 2000,
      reconnectionAttempts: Infinity,
    });
  }
  return socket;
}
