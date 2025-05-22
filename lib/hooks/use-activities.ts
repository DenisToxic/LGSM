"use client"

import useSWR from "swr"
import { useEffect } from "react"
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

export function useActivities() {
  const { socket, isConnected } = useWebSocket()

  const { data, error, isLoading, mutate } = useSWR("/api/activities", fetcher, {
    // Only poll if WebSockets are not connected
    refreshInterval: !isConnected ? 10000 : 0,
    revalidateOnFocus: true,
  })

  // Listen for WebSocket events related to activities
  useEffect(() => {
    if (!socket || !isConnected) return

    // Listen for new activity events
    const handleNewActivity = (activity: any) => {
      // Update the activities list with the new activity
      mutate((currentActivities) => {
        if (!currentActivities) return [activity]
        return [activity, ...currentActivities.slice(0, 99)] // Keep only the last 100 activities
      }, false) // Update the data without revalidation
    }

    // Register event listener
    socket.on("new_activity", handleNewActivity)

    // Cleanup on unmount
    return () => {
      socket.off("new_activity", handleNewActivity)
    }
  }, [socket, isConnected, mutate])

  return {
    activities: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}
