import { io, Socket } from "socket.io-client"


let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    const serverUrl = (import.meta as ImportMeta & { env?: { VITE_SERVER_URL?: string } }).env?.VITE_SERVER_URL ?? "http://localhost:4000"
    socket = io(serverUrl, {
      auth: { token: localStorage.getItem("token") },
      // don't auto-connect on import — connect() is called explicitly after login
      autoConnect: false,
    })
  }
  return socket
}

export function connectSocket() {
  const s = getSocket()
  if (!s.connected) s.connect()
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect()
    socket = null
  }
}
