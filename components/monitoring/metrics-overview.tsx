"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Cpu, HardDrive, Users, Network, Clock, Database } from "lucide-react"
import { useServers } from "@/lib/hooks/use-servers"
import { useServerMetrics } from "@/lib/hooks/use-server-metrics"
import { useWebSocket } from "@/lib/websocket-context"

interface MetricsOverviewProps {
  serverId: string | null
}

export function MetricsOverview({ serverId }: MetricsOverviewProps) {
  const { servers } = useServers()
  const { socket, isConnected } = useWebSocket()
  const [realTimeData, setRealTimeData] = useState<any>(null)

  // Use the hook, but only if we have a serverId
  const { metrics, isLoading } = useServerMetrics(serverId || "")

  const server = servers.find((s) => s.id === serverId)

  // Set up real-time updates via WebSocket
  useEffect(() => {
    if (!socket || !isConnected || !serverId) return

    const handleServerUpdate = (data: any) => {
      if (data.id === serverId) {
        setRealTimeData(data)
      }
    }

    socket.on("server_update", handleServerUpdate)

    return () => {
      socket.off("server_update", handleServerUpdate)
    }
  }, [socket, isConnected, serverId])

  // Merge real-time data with the latest metrics data
  const currentData = realTimeData || server

  if (!serverId || !server) {
    return <div className="text-center p-4 text-muted-foreground">Please select a server to view its metrics</div>
  }

  if (isLoading || !currentData) {
    return <MetricsOverviewSkeleton />
  }

  // Get latest metrics
  const getLatestMetric = (metricType: string) => {
    if (!metrics || !metrics.metrics[metricType] || metrics.metrics[metricType].length === 0) {
      return null
    }
    return metrics.metrics[metricType][metrics.metrics[metricType].length - 1].value
  }

  // Use latest from metrics history if available, otherwise use real-time value
  const cpuUsage = getLatestMetric("cpu") ?? currentData.cpu
  const memoryUsage = getLatestMetric("memory") ?? currentData.memory
  const playerPercent =
    getLatestMetric("players") ??
    (currentData.players.max > 0 ? (currentData.players.current / currentData.players.max) * 100 : 0)
  const networkUsage = getLatestMetric("network") ?? 50 // Fallback value
  const diskUsage = getLatestMetric("disk") ?? 30 // Fallback value

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <MetricCard
        icon={<Cpu className="h-4 w-4 text-blue-500" />}
        label="CPU Usage"
        value={cpuUsage}
        unit="%"
        progressColor="bg-blue-500"
      />

      <MetricCard
        icon={<HardDrive className="h-4 w-4 text-green-500" />}
        label="Memory Usage"
        value={memoryUsage}
        unit="%"
        progressColor="bg-green-500"
      />

      <MetricCard
        icon={<Users className="h-4 w-4 text-purple-500" />}
        label="Players"
        value={playerPercent}
        unit="%"
        secondaryText={`${currentData.players.current} / ${currentData.players.max}`}
        progressColor="bg-purple-500"
      />

      <MetricCard
        icon={<Network className="h-4 w-4 text-orange-500" />}
        label="Network I/O"
        value={networkUsage}
        unit="%"
        progressColor="bg-orange-500"
      />

      <MetricCard
        icon={<Database className="h-4 w-4 text-teal-500" />}
        label="Disk Usage"
        value={diskUsage}
        unit="%"
        progressColor="bg-teal-500"
      />

      <MetricCard
        icon={<Clock className="h-4 w-4 text-red-500" />}
        label="Uptime"
        value={currentData.uptime}
        isTextOnly
      />
    </div>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: number | string
  unit?: string
  secondaryText?: string
  progressColor?: string
  isTextOnly?: boolean
}

function MetricCard({
  icon,
  label,
  value,
  unit = "",
  secondaryText,
  progressColor = "bg-blue-500",
  isTextOnly = false,
}: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center">
            {icon}
            <span className="ml-2 text-sm font-medium">{label}</span>
          </div>
          {!isTextOnly && typeof value === "number" && (
            <span className="text-xl font-bold">
              {Math.round(value)}
              {unit}
            </span>
          )}
          {isTextOnly && <span className="text-xl font-bold">{value}</span>}
        </div>

        {!isTextOnly && typeof value === "number" && <Progress value={value} className={`h-2 ${progressColor}`} />}

        {secondaryText && <div className="mt-2 text-xs text-muted-foreground">{secondaryText}</div>}
      </CardContent>
    </Card>
  )
}

function MetricsOverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
