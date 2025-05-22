"use client"

import useSWR from "swr"
import { useState } from "react"
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

export function useBackups(serverId?: string) {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const { socket, isConnected } = useWebSocket()

  const url = serverId ? `/api/backups?serverId=${serverId}` : "/api/backups"

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: !isConnected ? 10000 : 0,
    revalidateOnFocus: true,
  })

  const createBackup = async (serverId: string) => {
    try {
      setIsCreating(true)
      const response = await fetch("/api/backups", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ serverId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create backup")
      }

      const newBackup = await response.json()

      // Update the local cache
      mutate()

      toast({
        title: "Backup started",
        description: `Backup for server has been initiated.`,
      })

      return newBackup
    } catch (error: any) {
      toast({
        title: "Failed to create backup",
        description: error.message || "An error occurred while creating the backup.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  const deleteBackup = async (id: string) => {
    try {
      const response = await fetch(`/api/backups/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete backup")
      }

      // Update the local cache
      mutate()

      toast({
        title: "Backup deleted",
        description: "The backup has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to delete backup",
        description: error.message || "An error occurred while deleting the backup.",
        variant: "destructive",
      })
    }
  }

  const restoreBackup = async (id: string) => {
    try {
      const response = await fetch(`/api/backups/${id}/restore`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to restore backup")
      }

      toast({
        title: "Restore initiated",
        description: "The server restore process has been initiated.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to restore backup",
        description: error.message || "An error occurred while restoring the backup.",
        variant: "destructive",
      })
    }
  }

  return {
    backups: data || [],
    isLoading,
    isError: error,
    isCreating,
    createBackup,
    deleteBackup,
    restoreBackup,
    mutate,
  }
}
