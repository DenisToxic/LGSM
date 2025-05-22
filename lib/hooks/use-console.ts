"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/lib/websocket-context"

export function useConsole(serverId: string) {
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const { toast } = useToast()
  const { isConnected, socket, joinServerRoom, leaveServerRoom } = useWebSocket()

  // Fetch initial console output
  useEffect(() => {
    const fetchConsoleOutput = async () => {
      if (!serverId) {
        setConsoleOutput(["[INFO] No server selected. Please select a server to view console output."])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setIsError(false)

      try {
        const response = await fetch(`/api/servers/${serverId}/console`)

        if (!response.ok) {
          throw new Error(`Failed to fetch console output: ${response.statusText}`)
        }

        const data = await response.json()
        setConsoleOutput(data.output || [])
      } catch (error) {
        console.error("Error fetching console output:", error)
        setIsError(true)
        setConsoleOutput(["[ERROR] Failed to fetch console output. Please try again later."])
        toast({
          title: "Error",
          description: "Failed to fetch console output",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConsoleOutput()

    // Join the server room for real-time updates
    if (serverId && isConnected && socket) {
      joinServerRoom(serverId)

      // Listen for console updates
      socket.on("console_update", (data) => {
        if (data.serverId === serverId) {
          setConsoleOutput((prev) => {
            // Add the command to the output
            const withCommand = data.command ? [...prev, `> ${data.command}`] : [...prev]
            // Add the response
            return [...withCommand, ...data.response]
          })
        }
      })
    }

    // Set up polling for console updates if WebSocket is not connected
    let interval: NodeJS.Timeout | null = null

    if (!isConnected && serverId) {
      interval = setInterval(() => {
        fetchConsoleOutput()
      }, 5000) // Poll every 5 seconds if WebSocket is not available
    }

    return () => {
      if (interval) clearInterval(interval)

      // Leave the server room when unmounting
      if (serverId && isConnected) {
        leaveServerRoom(serverId)

        // Remove event listeners
        if (socket) {
          socket.off("console_update")
        }
      }
    }
  }, [serverId, toast, isConnected, socket, joinServerRoom, leaveServerRoom])

  // Function to send a command to the server
  const sendCommand = async (command: string) => {
    if (!serverId || !command.trim()) return false

    try {
      const response = await fetch(`/api/servers/${serverId}/console`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ command }),
      })

      if (!response.ok) {
        throw new Error(`Failed to send command: ${response.statusText}`)
      }

      // If WebSockets are not connected, we need to manually update the console output
      if (!isConnected) {
        // Add the command to the console output immediately
        setConsoleOutput((prev) => [...prev, `> ${command}`])

        // Get the response from the server
        const data = await response.json()

        // Add the response to the console output
        if (data.response && Array.isArray(data.response)) {
          setConsoleOutput((prev) => [...prev, ...data.response])
        }
      }

      return true
    } catch (error) {
      console.error("Error sending command:", error)
      toast({
        title: "Error",
        description: "Failed to send command",
        variant: "destructive",
      })
      return false
    }
  }

  // Function to clear the console
  const clearConsole = () => {
    if (serverId) {
      sendCommand("clear")
    } else {
      setConsoleOutput(["[INFO] Console cleared."])
    }
  }

  return {
    consoleOutput,
    isLoading,
    isError,
    sendCommand,
    clearConsole,
  }
}
