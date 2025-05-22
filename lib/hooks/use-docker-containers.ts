"use client"

import useSWR from "swr"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useWebSocket } from "@/lib/websocket-context"
import type { DockerContainerConfig } from "@/lib/docker/docker-client"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.message = await res.text()
    throw error
  }
  return res.json()
}

export function useDockerContainers() {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)
  const { socket, isConnected } = useWebSocket()

  const { data, error, isLoading, mutate } = useSWR("/api/docker/containers", fetcher, {
    refreshInterval: !isConnected ? 10000 : 0,
    revalidateOnFocus: true,
  })

  const createContainer = async (containerConfig: DockerContainerConfig) => {
    try {
      setIsCreating(true)
      const response = await fetch("/api/docker/containers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(containerConfig),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create container")
      }

      const newContainer = await response.json()

      // Update the local cache
      mutate()

      toast({
        title: "Container created",
        description: `${newContainer.name} has been created.`,
      })

      return newContainer
    } catch (error: any) {
      toast({
        title: "Failed to create container",
        description: error.message || "An error occurred while creating the container.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  const deleteContainer = async (id: string) => {
    try {
      const response = await fetch(`/api/docker/containers/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete container")
      }

      // Update the local cache
      mutate()

      toast({
        title: "Container deleted",
        description: "The container has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to delete container",
        description: error.message || "An error occurred while deleting the container.",
        variant: "destructive",
      })
    }
  }

  const performContainerAction = async (id: string, action: "start" | "stop" | "restart") => {
    try {
      const response = await fetch(`/api/docker/containers/${id}/action`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action} container`)
      }

      // Update the local cache
      mutate()

      const actionMap = {
        start: "started",
        stop: "stopped",
        restart: "restarted",
      }

      toast({
        title: `Container ${actionMap[action]}`,
        description: `The container is being ${actionMap[action]}.`,
      })
    } catch (error: any) {
      toast({
        title: `Failed to ${action} container`,
        description: error.message || `An error occurred while ${action}ing the container.`,
        variant: "destructive",
      })
    }
  }

  const getContainerLogs = async (id: string) => {
    try {
      const response = await fetch(`/api/docker/containers/${id}/logs`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get container logs")
      }

      const data = await response.json()
      return data.logs
    } catch (error: any) {
      toast({
        title: "Failed to get container logs",
        description: error.message || "An error occurred while getting container logs.",
        variant: "destructive",
      })
      return []
    }
  }

  return {
    containers: data || [],
    isLoading,
    isError: error,
    isCreating,
    createContainer,
    deleteContainer,
    performContainerAction,
    getContainerLogs,
    mutate,
  }
}
