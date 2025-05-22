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

export function useMetrics() {
  const { socket, isConnected } = useWebSocket()

  const { data, error, isLoading, mutate } = useSWR("/api/metrics", fetcher, {
    // Only poll if WebSockets are not connected
    refreshInterval: !isConnected ? 5000 : 0,
    revalidateOnFocus: true,
  })

  // Listen for WebSocket events related to metrics
  useEffect(() => {
    if (!socket || !isConnected) return

    // Listen for system metrics updates
    const handleSystemMetrics = (metricsData: any) => {
      mutate(metricsData, false) // Update the data without revalidation
    }

    // Register event listener
    socket.on("system_metrics", handleSystemMetrics)

    // Cleanup on unmount
    return () => {
      socket.off("system_metrics", handleSystemMetrics)
    }
  }, [socket, isConnected, mutate])

  return {
    metrics: data || {
      totalServers: 0,
      onlineServers: 0,
      offlineServers: 0,
      activeUsers: 0,
      cpuUsage: 0,
      memoryUsage: 0,
      timestamp: new Date().toISOString(),
    },
    isLoading,
    isError: error,
    mutate, // Explicitly return the mutate function
  }
}
