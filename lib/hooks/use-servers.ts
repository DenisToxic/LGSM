"use client"

import useSWR from "swr"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/lib/websocket-context"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.message = await res.text()
    throw error
  }
  return res.json()
}

export function useServers() {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const { socket, isConnected } = useWebSocket()

  const { data, error, isLoading, mutate } = useSWR("/api/servers", fetcher, {
    // Only poll if WebSockets are not connected
    refreshInterval: !isConnected ? 10000 : 0,
    revalidateOnFocus: true,
  })

  // Listen for WebSocket events related to servers
  useEffect(() => {
    if (!socket || !isConnected) return

    // Listen for server created event
    const handleServerCreated = (newServer: any) => {
      mutate()
    }

    // Listen for server updated event
    const handleServerUpdated = (updatedServer: any) => {
      mutate()
    }

    // Listen for server deleted event
    const handleServerDeleted = (deletedServer: any) => {
      mutate()
    }

    // Listen for server action events
    const handleServerAction = (data: any) => {
      mutate()
    }

    // Register event listeners
    socket.on("server_created", handleServerCreated)
    socket.on("server_updated", handleServerUpdated)
    socket.on("server_deleted", handleServerDeleted)
    socket.on("server_start", handleServerAction)
    socket.on("server_stop", handleServerAction)
    socket.on("server_restart", handleServerAction)
    socket.on("server_backup", handleServerAction)

    // Cleanup on unmount
    return () => {
      socket.off("server_created", handleServerCreated)
      socket.off("server_updated", handleServerUpdated)
      socket.off("server_deleted", handleServerDeleted)
      socket.off("server_start", handleServerAction)
      socket.off("server_stop", handleServerAction)
      socket.off("server_restart", handleServerAction)
      socket.off("server_backup", handleServerAction)
    }
  }, [socket, isConnected, mutate])

  const createServer = async (serverData: any) => {
    try {
      setIsCreating(true)
      const response = await fetch("/api/servers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(serverData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create server")
      }

      const newServer = await response.json()

      // Update the local cache
      mutate()

      toast({
        title: "Server created",
        description: `${newServer.name} has been created and is starting up.`,
      })

      return newServer
    } catch (error: any) {
      toast({
        title: "Failed to create server",
        description: error.message || "An error occurred while creating the server.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  const deleteServer = async (id: string) => {
    try {
      const response = await fetch(`/api/servers/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete server")
      }

      // Update the local cache
      mutate()

      toast({
        title: "Server deleted",
        description: "The server has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to delete server",
        description: error.message || "An error occurred while deleting the server.",
        variant: "destructive",
      })
    }
  }

  const performServerAction = async (id: string, action: "start" | "stop" | "restart" | "backup") => {
    try {
      const response = await fetch(`/api/servers/${id}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action} server`)
      }

      // Update the local cache
      mutate()

      const actionMap = {
        start: "started",
        stop: "stopped",
        restart: "restarted",
        backup: "backed up",
      }

      toast({
        title: `Server ${actionMap[action]}`,
        description: `The server is being ${actionMap[action]}.`,
      })
    } catch (error: any) {
      toast({
        title: `Failed to ${action} server`,
        description: error.message || `An error occurred while ${action}ing the server.`,
        variant: "destructive",
      })
    }
  }

  return {
    servers: data || [],
    isLoading,
    isError: error,
    isCreating,
    createServer,
    deleteServer,
    performServerAction,
    mutate,
  }
}
