import { io, Socket } from "socket.io-client"
import { serverUrl } from "./serverUrl"


let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
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
