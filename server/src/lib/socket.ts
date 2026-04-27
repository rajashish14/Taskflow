import { Server } from "socket.io"

let io: Server

export function initSocket(server: Server) {
  io = server
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialised yet")
  return io
}

// helpers so route handlers don't need to know about room naming
export function emitToUser(userId: string, event: string, data: unknown) {
  getIO().to(`user:${userId}`).emit(event, data)
}
