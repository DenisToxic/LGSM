"use client"

import useSWR from "swr"
import { useEffect } from "react"
import { useWebSocket } from "@/lib/websocket-context"
import type { TimeRange, ServerMetrics } from "@/lib/monitoring-store"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.message = await res.text()
    throw error
  }
  return res.json()
}

export function useServerMetrics(serverId: string, timeRange: TimeRange = "24h", startDate?: string, endDate?: string) {
  const { socket, isConnected } = useWebSocket()

  // Build URL with query parameters
  const buildUrl = () => {
    const params = new URLSearchParams()
    params.append("serverId", serverId)
    params.append("timeRange", timeRange)
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)

    return `/api/monitoring/metrics?${params.toString()}`
  }

  const { data, error, isLoading, mutate } = useSWR<ServerMetrics>(serverId ? buildUrl() : null, fetcher, {
    refreshInterval: !isConnected ? 60000 : 0, // Polling fallback if WebSockets aren't connected
    revalidateOnFocus: true,
  })

  // Listen for WebSocket events for real-time updates
  useEffect(() => {
    if (!socket || !isConnected || !serverId) return

    const handleMetricsUpdate = (serverMetrics: any) => {
      if (serverMetrics.id === serverId) {
        mutate()
      }
    }

    socket.on("server_metrics_update", handleMetricsUpdate)

    return () => {
      socket.off("server_metrics_update", handleMetricsUpdate)
    }
  }, [socket, isConnected, serverId, mutate])

  return {
    metrics: data,
    isLoading,
    isError: error,
    mutate,
  }
}
