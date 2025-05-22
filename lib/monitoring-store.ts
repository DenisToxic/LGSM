import type { Server } from "@/lib/server-store"
import { getServers } from "@/lib/server-store"

export type MetricType = "cpu" | "memory" | "players" | "network" | "disk" | "uptime"

export type MetricSeverity = "info" | "warning" | "critical"

export type MetricThreshold = {
  id: string
  metricType: MetricType
  operator: "gt" | "lt" | "eq" | "gte" | "lte"
  value: number
  severity: MetricSeverity
  enabled: boolean
  serverId?: string // If null/undefined, applies to all servers
  createdAt: string
}

export type Alert = {
  id: string
  thresholdId: string
  serverId: string
  serverName: string
  metricType: MetricType
  value: number
  threshold: number
  operator: "gt" | "lt" | "eq" | "gte" | "lte"
  severity: MetricSeverity
  status: "active" | "acknowledged" | "resolved"
  createdAt: string
  acknowledgedAt?: string
  resolvedAt?: string
  notified: boolean
}

export type TimeRange = "1h" | "24h" | "7d" | "30d" | "custom"

export type MetricDataPoint = {
  timestamp: string
  value: number
}

export type ServerMetrics = {
  id: string
  name: string
  metrics: {
    cpu: MetricDataPoint[]
    memory: MetricDataPoint[]
    players: MetricDataPoint[]
    network: MetricDataPoint[]
    disk: MetricDataPoint[]
    uptime: MetricDataPoint[]
  }
}

// In-memory stores
const thresholds: MetricThreshold[] = [
  {
    id: "threshold-1",
    metricType: "cpu",
    operator: "gt",
    value: 90,
    severity: "warning",
    enabled: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "threshold-2",
    metricType: "memory",
    operator: "gt",
    value: 85,
    severity: "warning",
    enabled: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "threshold-3",
    metricType: "players",
    operator: "gt",
    value: 90,
    severity: "warning",
    enabled: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "threshold-4",
    metricType: "cpu",
    operator: "gt",
    value: 95,
    severity: "critical",
    enabled: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

const alerts: Alert[] = []

// Historical metrics data (simulated)
const serverMetricsHistory: Map<string, ServerMetrics> = new Map()

// Helper to check if a threshold is violated
function checkThreshold(threshold: MetricThreshold, value: number): boolean {
  switch (threshold.operator) {
    case "gt":
      return value > threshold.value
    case "lt":
      return value < threshold.value
    case "eq":
      return value === threshold.value
    case "gte":
      return value >= threshold.value
    case "lte":
      return value <= threshold.value
    default:
      return false
  }
}

// Helper to get operator as string
function getOperatorString(operator: "gt" | "lt" | "eq" | "gte" | "lte"): string {
  switch (operator) {
    case "gt":
      return ">"
    case "lt":
      return "<"
    case "eq":
      return "="
    case "gte":
      return ">="
    case "lte":
      return "<="
  }
}

// Threshold methods
export function getThresholds(): MetricThreshold[] {
  return [...thresholds]
}

export function getThresholdById(id: string): MetricThreshold | undefined {
  return thresholds.find((t) => t.id === id)
}

export function createThreshold(data: Omit<MetricThreshold, "id" | "createdAt">): MetricThreshold {
  const newThreshold: MetricThreshold = {
    id: `threshold-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    ...data,
  }

  thresholds.push(newThreshold)
  return newThreshold
}

export function updateThreshold(
  id: string,
  data: Partial<Omit<MetricThreshold, "id" | "createdAt">>,
): MetricThreshold | null {
  const index = thresholds.findIndex((t) => t.id === id)
  if (index === -1) return null

  const updatedThreshold = {
    ...thresholds[index],
    ...data,
  }

  thresholds[index] = updatedThreshold
  return updatedThreshold
}

export function deleteThreshold(id: string): boolean {
  const initialLength = thresholds.length
  const filteredThresholds = thresholds.filter((t) => t.id !== id)

  if (filteredThresholds.length < initialLength) {
    // Copy the filtered array back to the original reference
    thresholds.length = 0
    thresholds.push(...filteredThresholds)
    return true
  }

  return false
}

// Alert methods
export function getAlerts(options?: {
  status?: "active" | "acknowledged" | "resolved"
  serverId?: string
  severity?: MetricSeverity
}): Alert[] {
  return [...alerts]
    .filter((a) => !options?.status || a.status === options.status)
    .filter((a) => !options?.serverId || a.serverId === options.serverId)
    .filter((a) => !options?.severity || a.severity === options.severity)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function getAlertById(id: string): Alert | undefined {
  return alerts.find((a) => a.id === id)
}

export function createAlert(data: Omit<Alert, "id" | "createdAt" | "status" | "notified">): Alert {
  const newAlert: Alert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    status: "active",
    createdAt: new Date().toISOString(),
    notified: false,
    ...data,
  }

  alerts.push(newAlert)
  return newAlert
}

export function updateAlertStatus(id: string, status: "active" | "acknowledged" | "resolved"): Alert | null {
  const index = alerts.findIndex((a) => a.id === id)
  if (index === -1) return null

  const updatedAlert = {
    ...alerts[index],
    status,
  }

  if (status === "acknowledged" && !updatedAlert.acknowledgedAt) {
    updatedAlert.acknowledgedAt = new Date().toISOString()
  } else if (status === "resolved" && !updatedAlert.resolvedAt) {
    updatedAlert.resolvedAt = new Date().toISOString()
  }

  alerts[index] = updatedAlert
  return updatedAlert
}

export function markAlertAsNotified(id: string): Alert | null {
  const index = alerts.findIndex((a) => a.id === id)
  if (index === -1) return null

  const updatedAlert = {
    ...alerts[index],
    notified: true,
  }

  alerts[index] = updatedAlert
  return updatedAlert
}

// Metrics data methods
export function getServerMetricsHistory(
  serverId: string,
  timeRange: TimeRange,
  startDate?: string,
  endDate?: string,
): ServerMetrics | null {
  const serverMetrics = serverMetricsHistory.get(serverId)
  if (!serverMetrics) return null

  // Filter metrics based on time range
  const now = new Date()
  let startTime: Date

  switch (timeRange) {
    case "1h":
      startTime = new Date(now.getTime() - 60 * 60 * 1000)
      break
    case "24h":
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case "7d":
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "30d":
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case "custom":
      startTime = startDate ? new Date(startDate) : new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    default:
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }

  const endTime = endDate ? new Date(endDate) : now

  const filterByTimeRange = (dataPoints: MetricDataPoint[]): MetricDataPoint[] => {
    return dataPoints.filter((point) => {
      const timestamp = new Date(point.timestamp)
      return timestamp >= startTime && timestamp <= endTime
    })
  }

  return {
    id: serverMetrics.id,
    name: serverMetrics.name,
    metrics: {
      cpu: filterByTimeRange(serverMetrics.metrics.cpu),
      memory: filterByTimeRange(serverMetrics.metrics.memory),
      players: filterByTimeRange(serverMetrics.metrics.players),
      network: filterByTimeRange(serverMetrics.metrics.network),
      disk: filterByTimeRange(serverMetrics.metrics.disk),
      uptime: filterByTimeRange(serverMetrics.metrics.uptime),
    },
  }
}

// Initialize historical data with some sample points
export function initializeMetricsHistory() {
  getServers().forEach((server) => {
    // Create metrics for this server if they don't exist
    if (!serverMetricsHistory.has(server.id)) {
      const now = Date.now()
      const history: ServerMetrics = {
        id: server.id,
        name: server.name,
        metrics: {
          cpu: [],
          memory: [],
          players: [],
          network: [],
          disk: [],
          uptime: [],
        },
      }

      // Generate historical data points for the last 30 days
      for (let i = 0; i < 720; i++) {
        // 30 days * 24 hours = 720 hours
        const timestamp = new Date(now - (720 - i) * 60 * 60 * 1000).toISOString()

        // CPU: Fluctuate between 10% and 90% with some daily patterns
        const hourOfDay = new Date(timestamp).getHours()
        const isDaytime = hourOfDay >= 8 && hourOfDay <= 22
        const baseCpu = isDaytime ? 40 : 20
        const cpu = Math.min(90, Math.max(10, baseCpu + Math.random() * 30))

        // Memory: Steadily increases and drops occasionally
        const baseMemory = 30 + (i % 48) * 0.8
        const memory = Math.min(95, Math.max(20, baseMemory + Math.random() * 15))

        // Players: Follow a similar pattern to CPU usage
        const basePlayers = isDaytime ? 60 : 20
        const players = Math.min(100, Math.max(0, basePlayers + Math.random() * 40))

        // Network: Correlates somewhat with player count
        const network = players * 0.8 + Math.random() * 20

        // Disk: Gradually increases over time
        const disk = 20 + (i / 720) * 40 + Math.random() * 5

        // Uptime: Resets occasionally
        const uptime = i % 168 // Simulates weekly restarts

        history.metrics.cpu.push({ timestamp, value: cpu })
        history.metrics.memory.push({ timestamp, value: memory })
        history.metrics.players.push({ timestamp, value: players })
        history.metrics.network.push({ timestamp, value: network })
        history.metrics.disk.push({ timestamp, value: disk })
        history.metrics.uptime.push({ timestamp, value: uptime })
      }

      serverMetricsHistory.set(server.id, history)
    }
  })
}

// Update metrics with current server data
export function updateMetrics() {
  getServers().forEach((server) => {
    if (server.status !== "online") return

    // Create or update metrics for this server
    let serverMetrics = serverMetricsHistory.get(server.id)

    if (!serverMetrics) {
      serverMetrics = {
        id: server.id,
        name: server.name,
        metrics: {
          cpu: [],
          memory: [],
          players: [],
          network: [],
          disk: [],
          uptime: [],
        },
      }
      serverMetricsHistory.set(server.id, serverMetrics)
    }

    const timestamp = new Date().toISOString()

    // Add current values
    serverMetrics.metrics.cpu.push({ timestamp, value: server.cpu })
    serverMetrics.metrics.memory.push({ timestamp, value: server.memory })

    const playerPercentage = (server.players.current / server.players.max) * 100
    serverMetrics.metrics.players.push({ timestamp, value: playerPercentage })

    // Simulate network and disk usage based on players and uptime
    const networkUsage = 20 + playerPercentage * 0.6 + Math.random() * 10
    serverMetrics.metrics.network.push({ timestamp, value: networkUsage })

    // Disk gradually increases
    const lastDisk =
      serverMetrics.metrics.disk.length > 0
        ? serverMetrics.metrics.disk[serverMetrics.metrics.disk.length - 1].value
        : 20
    const diskUsage = Math.min(100, lastDisk + Math.random() * 0.1)
    serverMetrics.metrics.disk.push({ timestamp, value: diskUsage })

    // Parse uptime
    let uptimeValue = 0
    const uptimeString = server.uptime
    if (uptimeString.includes("d")) {
      const days = Number.parseInt(uptimeString.split("d")[0])
      uptimeValue = days * 24

      const hoursPart = uptimeString.split("d")[1].trim()
      if (hoursPart.includes("h")) {
        const hours = Number.parseInt(hoursPart.split("h")[0])
        uptimeValue += hours
      }
    } else if (uptimeString.includes("h")) {
      const hours = Number.parseInt(uptimeString.split("h")[0])
      uptimeValue = hours
    } else if (uptimeString.includes("m")) {
      const minutes = Number.parseInt(uptimeString.split("m")[0])
      uptimeValue = minutes / 60
    }

    serverMetrics.metrics.uptime.push({ timestamp, value: uptimeValue })

    // Remove old data points (keep last 30 days worth)
    const maxDataPoints = 30 * 24 * 60 // 30 days of minute-level data
    const truncateArray = (arr: MetricDataPoint[]) => {
      if (arr.length > maxDataPoints) {
        return arr.slice(arr.length - maxDataPoints)
      }
      return arr
    }

    serverMetrics.metrics.cpu = truncateArray(serverMetrics.metrics.cpu)
    serverMetrics.metrics.memory = truncateArray(serverMetrics.metrics.memory)
    serverMetrics.metrics.players = truncateArray(serverMetrics.metrics.players)
    serverMetrics.metrics.network = truncateArray(serverMetrics.metrics.network)
    serverMetrics.metrics.disk = truncateArray(serverMetrics.metrics.disk)
    serverMetrics.metrics.uptime = truncateArray(serverMetrics.metrics.uptime)

    // Check for threshold violations
    checkThresholds(server)
  })
}

// Check thresholds for a server
function checkThresholds(server: Server) {
  if (server.status !== "online") return

  thresholds.forEach((threshold) => {
    if (!threshold.enabled) return
    if (threshold.serverId && threshold.serverId !== server.id) return

    let currentValue: number

    switch (threshold.metricType) {
      case "cpu":
        currentValue = server.cpu
        break
      case "memory":
        currentValue = server.memory
        break
      case "players":
        currentValue = (server.players.current / server.players.max) * 100
        break
      case "network":
        // Use a simulated value since we don't have real network metrics
        currentValue = 20 + (server.players.current / server.players.max) * 60 + Math.random() * 10
        break
      case "disk":
        // Simulate disk usage
        currentValue = 20 + server.memory * 0.5 + Math.random() * 10
        break
      case "uptime":
        // Parse uptime
        let uptimeValue = 0
        const uptimeString = server.uptime
        if (uptimeString.includes("d")) {
          const days = Number.parseInt(uptimeString.split("d")[0])
          uptimeValue = days * 24

          const hoursPart = uptimeString.split("d")[1].trim()
          if (hoursPart.includes("h")) {
            const hours = Number.parseInt(hoursPart.split("h")[0])
            uptimeValue += hours
          }
        } else if (uptimeString.includes("h")) {
          const hours = Number.parseInt(uptimeString.split("h")[0])
          uptimeValue = hours
        } else if (uptimeString.includes("m")) {
          const minutes = Number.parseInt(uptimeString.split("m")[0])
          uptimeValue = minutes / 60
        }
        currentValue = uptimeValue
        break
      default:
        return
    }

    const isViolated = checkThreshold(threshold, currentValue)

    if (isViolated) {
      // Check if there's already an active alert for this server and threshold
      const existingAlert = alerts.find(
        (a) =>
          a.serverId === server.id &&
          a.thresholdId === threshold.id &&
          (a.status === "active" || a.status === "acknowledged"),
      )

      if (!existingAlert) {
        // Create a new alert
        createAlert({
          thresholdId: threshold.id,
          serverId: server.id,
          serverName: server.name,
          metricType: threshold.metricType,
          value: currentValue,
          threshold: threshold.value,
          operator: threshold.operator,
          severity: threshold.severity,
        })
      } else if (existingAlert.value !== currentValue) {
        // Update the alert value
        const index = alerts.findIndex((a) => a.id === existingAlert.id)
        alerts[index].value = currentValue
      }
    } else {
      // Check if there's an active alert that should be resolved
      const existingAlert = alerts.find(
        (a) =>
          a.serverId === server.id &&
          a.thresholdId === threshold.id &&
          (a.status === "active" || a.status === "acknowledged"),
      )

      if (existingAlert) {
        // Resolve the alert
        updateAlertStatus(existingAlert.id, "resolved")
      }
    }
  })
}

// Start metric collection and alert checking
export function startMonitoring() {
  // First, initialize historical data
  initializeMetricsHistory()

  // Update metrics every minute
  setInterval(() => {
    updateMetrics()
  }, 60000)
}

// Start monitoring
startMonitoring()
