"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"

type WebSocketContextType = {
  socket: Socket | null
  isConnected: boolean
}

const WebSocketContext = createContext<WebSocketContextType>({
  socket: null,
  isConnected: false,
})

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    // Get the WebSocket URL from environment variables
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "ws://localhost:3001"
    
    // Initialize Socket.IO with proper path
    const socketInstance = io(socketUrl, {
      path: "/socket.io/", // Ensure this matches the server configuration
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    })

    // Set up event listeners
    socketInstance.on("connect", () => {
      console.log("WebSocket connected")
      setIsConnected(true)
    })

    socketInstance.on("disconnect", () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
    })

    socketInstance.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error)
      setIsConnected(false)
    })

    // Store the socket instance
    setSocket(socketInstance)

    // Clean up on unmount
    return () => {
      socketInstance.disconnect()
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  )
}

export function useWebSocket() {
  return useContext(WebSocketContext)
}