"use client"

import { useState, useEffect } from "react"

import { ChartContainer, ChartLegend, ChartLegendItem } from "@/components/ui/chart"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, RefreshCw } from "lucide-react"
import { ServerCreationWizard } from "@/components/server-creation-wizard"
import { useServers } from "@/lib/hooks/use-servers"
import { useWebSocket } from "@/lib/websocket-context"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

export function ServerStatusChart() {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const { servers, isLoading, isError, mutate } = useServers()
  const { socket, isConnected } = useWebSocket()
  const [chartData, setChartData] = useState<any[]>([])

  // Generate initial chart data based on real servers
  useEffect(() => {
    if (servers.length === 0) return

    const generateChartData = () => {
      const data = []
      const now = new Date()

      for (let i = 23; i >= 0; i--) {
        const time = new Date(now)
        time.setHours(now.getHours() - i)

        // Calculate average CPU and memory usage
        let totalCpu = 0
        let totalMemory = 0
        let totalPlayers = 0

        servers.forEach((server) => {
          if (server.status === "online") {
            // Add some randomness to make the chart more interesting
            const randomFactor = 0.8 + Math.random() * 0.4
            totalCpu += server.cpu * randomFactor
            totalMemory += server.memory * randomFactor
            totalPlayers += server.players.current
          }
        })

        // Normalize values
        const onlineServers = servers.filter((s) => s.status === "online").length
        const serverCount = onlineServers || 1
        const cpu = Math.min(Math.round(totalCpu / serverCount), 100)
        const memory = Math.min(Math.round(totalMemory / serverCount), 100)

        data.push({
          time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          cpu,
          memory,
          players: totalPlayers,
        })
      }

      return data
    }

    setChartData(generateChartData())
  }, [servers])

  // Listen for real-time metrics updates via WebSocket
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleMetricsUpdate = (data: any) => {
      setChartData((currentData) => {
        // Create a copy of the current data
        const newData = [...currentData]

        // Remove the oldest data point
        newData.shift()

        // Add the new data point
        const now = new Date()
        newData.push({
          time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          cpu: data.cpuUsage,
          memory: data.memoryUsage,
          players: data.activeUsers,
        })

        return newData
      })
    }

    // Register event listener
    socket.on("system_metrics", handleMetricsUpdate)

    // Cleanup on unmount
    return () => {
      socket.off("system_metrics", handleMetricsUpdate)
    }
  }, [socket, isConnected])

  if (isError) {
    return (
      <Card className="h-[300px] flex flex-col items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <CardDescription className="mb-4">Error loading chart data. Please try again.</CardDescription>
          <Button onClick={() => mutate()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="h-[300px] flex flex-col items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <CardDescription>Loading chart data...</CardDescription>
        </CardContent>
      </Card>
    )
  }

  if (servers.length === 0) {
    return (
      <Card className="h-[300px] flex flex-col items-center justify-center">
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <CardDescription className="mb-4">
            No server data available. Create a server to start monitoring performance.
          </CardDescription>
          <Button onClick={() => setIsWizardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Server
          </Button>
          <ServerCreationWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />
        </CardContent>
      </Card>
    )
  }

  return (
    <ChartContainer className="h-[300px]">
      <ChartLegend className="mb-4">
        <ChartLegendItem name="CPU Usage" color="#22c55e" />
        <ChartLegendItem name="Memory Usage" color="#3b82f6" />
        <ChartLegendItem name="Active Players" color="#f97316" />
      </ChartLegend>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorPlayers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="time" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            domain={[0, "auto"]}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-md border bg-background p-2 shadow-sm">
                    <div className="font-medium">{payload[0].payload.time}</div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-[#22c55e] mr-2" />
                      <span>CPU: {payload[0].value}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-[#3b82f6] mr-2" />
                      <span>Memory: {payload[1].value}%</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-[#f97316] mr-2" />
                      <span>Players: {payload[2].value}</span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Area type="monotone" dataKey="cpu" stroke="#22c55e" fillOpacity={1} fill="url(#colorCpu)" yAxisId="left" />
          <Area
            type="monotone"
            dataKey="memory"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorMemory)"
            yAxisId="left"
          />
          <Area
            type="monotone"
            dataKey="players"
            stroke="#f97316"
            fillOpacity={1}
            fill="url(#colorPlayers)"
            yAxisId="right"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
