"use client"

import useSWR from "swr"
import { useEffect } from "react"
import { useWebSocket } from "@/lib/websocket-context"
import { useToast } from "@/hooks/use-toast"
import type { Alert, MetricSeverity } from "@/lib/monitoring-store"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.message = await res.text()
    throw error
  }
  return res.json()
}

export function useAlerts(options?: {
  status?: "active" | "acknowledged" | "resolved"
  serverId?: string
  severity?: MetricSeverity
}) {
  const { toast } = useToast()
  const { socket, isConnected } = useWebSocket()

  // Build URL with query parameters
  const buildUrl = () => {
    const params = new URLSearchParams()
    if (options?.status) params.append("status", options.status)
    if (options?.serverId) params.append("serverId", options.serverId)
    if (options?.severity) params.append("severity", options.severity)

    return `/api/monitoring/alerts?${params.toString()}`
  }

  const { data, error, isLoading, mutate } = useSWR<Alert[]>(buildUrl(), fetcher, {
    refreshInterval: !isConnected ? 30000 : 0,
    revalidateOnFocus: true,
  })

  // Update alert status
  const updateAlertStatus = async (alertId: string, status: "acknowledged" | "resolved") => {
    try {
      const response = await fetch(`/api/monitoring/alerts/${alertId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update alert status")
      }

      // Update the local cache
      mutate()

      toast({
        title: `Alert ${status}`,
        description: `The alert has been ${status}.`,
      })
    } catch (error: any) {
      toast({
        title: `Failed to update alert`,
        description: error.message || "An error occurred while updating the alert.",
        variant: "destructive",
      })
    }
  }

  // Listen for WebSocket events for new alerts
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleNewAlert = (alert: Alert) => {
      // Verify if the alert matches the current filter criteria
      let shouldUpdate = true

      if (options?.status && alert.status !== options.status) {
        shouldUpdate = false
      }

      if (options?.serverId && alert.serverId !== options.serverId) {
        shouldUpdate = false
      }

      if (options?.severity && alert.severity !== options.severity) {
        shouldUpdate = false
      }

      if (shouldUpdate) {
        mutate()

        // Show a toast notification for new alerts
        if (alert.status === "active" && !alert.notified) {
          const severityColor = {
            info: "blue",
            warning: "yellow",
            critical: "red",
          }[alert.severity]

          toast({
            title: `${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)} Alert`,
            description: `${alert.serverName}: ${alert.metricType} is ${alert.value}% (threshold: ${alert.threshold}%)`,
            variant: alert.severity === "critical" ? "destructive" : "default",
          })

          // Mark as notified on the server
          fetch(`/api/monitoring/alerts/${alert.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ notified: true }),
          }).catch(console.error)
        }
      }
    }

    const handleAlertUpdate = () => {
      mutate()
    }

    socket.on("new_alert", handleNewAlert)
    socket.on("alert_update", handleAlertUpdate)

    return () => {
      socket.off("new_alert", handleNewAlert)
      socket.off("alert_update", handleAlertUpdate)
    }
  }, [socket, isConnected, mutate, toast, options])

  return {
    alerts: data || [],
    isLoading,
    isError: error,
    updateAlertStatus,
    mutate,
  }
}
