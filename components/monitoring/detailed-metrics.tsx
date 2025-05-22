"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2 } from "lucide-react"
import { useServerMetrics } from "@/lib/hooks/use-server-metrics"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import type { TimeRange } from "@/lib/monitoring-store"

interface DetailedMetricsProps {
  serverId: string | null
}

export function DetailedMetrics({ serverId }: DetailedMetricsProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("24h")
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [activeMetric, setActiveMetric] = useState("cpu")

  const { metrics, isLoading, isError } = useServerMetrics(
    serverId || "",
    timeRange,
    startDate?.toISOString(),
    endDate?.toISOString(),
  )

  if (!serverId) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Please select a server to view detailed metrics
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg">Loading metrics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isError || !metrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Error loading metrics. The server may not have any recorded metrics yet.
        </CardContent>
      </Card>
    )
  }

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange)

    // Reset custom dates if not selecting custom
    if (value !== "custom") {
      setStartDate(undefined)
      setEndDate(undefined)
    } else {
      // Set default custom date range if empty
      if (!startDate) {
        const defaultStart = new Date()
        defaultStart.setDate(defaultStart.getDate() - 7)
        setStartDate(defaultStart)
      }
      if (!endDate) {
        setEndDate(new Date())
      }
    }
  }

  // Format the data for the charts
  const formatData = (metricType: string) => {
    if (!metrics.metrics[metricType] || metrics.metrics[metricType].length === 0) {
      return []
    }

    // Sample the data to avoid too many points
    const dataPoints = metrics.metrics[metricType]
    const maxPoints = 100
    const step = Math.max(1, Math.floor(dataPoints.length / maxPoints))

    return dataPoints
      .filter((_, i) => i % step === 0 || i === dataPoints.length - 1)
      .map((point) => ({
        time: new Date(point.timestamp).toLocaleString(),
        value: point.value,
      }))
  }

  // Get the appropriate Y-axis domain and formatting based on the metric type
  const getYAxisConfig = (metricType: string) => {
    switch (metricType) {
      case "cpu":
      case "memory":
      case "players":
      case "disk":
      case "network":
        return {
          domain: [0, 100],
          formatter: (value: number) => `${value}%`,
        }
      case "uptime":
        return {
          domain: [0, "auto"],
          formatter: (value: number) => `${value}h`,
        }
      default:
        return {
          domain: [0, 100],
          formatter: (value: number) => `${value}`,
        }
    }
  }

  const yAxisConfig = getYAxisConfig(activeMetric)
  const chartData = formatData(activeMetric)

  // Get color based on metric type
  const getMetricColor = (metricType: string) => {
    switch (metricType) {
      case "cpu":
        return "#3b82f6" // blue
      case "memory":
        return "#22c55e" // green
      case "players":
        return "#a855f7" // purple
      case "network":
        return "#f97316" // orange
      case "disk":
        return "#14b8a6" // teal
      case "uptime":
        return "#ef4444" // red
      default:
        return "#3b82f6" // blue
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Detailed Metrics</CardTitle>
            <CardDescription>Historical performance data for {metrics.name}</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Select value={timeRange} onValueChange={handleTimeRangeChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {timeRange === "custom" && (
              <div className="flex gap-2">
                <DatePicker date={startDate} setDate={setStartDate} placeholder="From" />
                <DatePicker date={endDate} setDate={setEndDate} placeholder="To" />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeMetric} onValueChange={setActiveMetric} className="space-y-4">
          <TabsList className="w-full flex flex-wrap">
            <TabsTrigger value="cpu" className="flex-1">
              CPU
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex-1">
              Memory
            </TabsTrigger>
            <TabsTrigger value="players" className="flex-1">
              Players
            </TabsTrigger>
            <TabsTrigger value="network" className="flex-1">
              Network
            </TabsTrigger>
            <TabsTrigger value="disk" className="flex-1">
              Disk
            </TabsTrigger>
            <TabsTrigger value="uptime" className="flex-1">
              Uptime
            </TabsTrigger>
          </TabsList>

          {chartData.length === 0 ? (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              No data available for the selected period
            </div>
          ) : (
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={30}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    }}
                  />
                  <YAxis
                    domain={yAxisConfig.domain}
                    tickFormatter={yAxisConfig.formatter}
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="rounded-md border bg-background p-2 shadow-sm">
                            <div className="font-medium">{new Date(payload[0].payload.time).toLocaleString()}</div>
                            <div className="flex items-center">
                              <div
                                className={`h-2 w-2 rounded-full mr-2`}
                                style={{ backgroundColor: getMetricColor(activeMetric) }}
                              />
                              <span>{yAxisConfig.formatter(payload[0].value)}</span>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={getMetricColor(activeMetric)}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
