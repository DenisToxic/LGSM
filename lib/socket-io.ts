import type { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"
import type { NextApiResponse } from "next"
import type { Socket as ClientSocket } from "socket.io-client"

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io: SocketIOServer
    }
  }
}

// This is a helper to get the Socket.IO instance from the server
export function getSocketIO(res: NextApiResponseWithSocket): SocketIOServer {
  return res.socket.server.io
}

// Client-side socket instance
let socket: ClientSocket | null = null

export function getClientSocket(): ClientSocket | null {
  return socket
}

export function setClientSocket(newSocket: ClientSocket | null): void {
  socket = newSocket
}
