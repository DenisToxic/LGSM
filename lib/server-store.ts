// This file simulates a database for our application
// In a real application, you would replace this with actual database calls

import type { ServerFormData } from "@/components/server-creation-wizard"

export type ServerStatus = "online" | "offline" | "starting" | "stopping" | "restarting"

export type Server = {
  id: string
  name: string
  gameType: string
  description: string
  status: ServerStatus
  version: string
  port: number
  maxPlayers: number
  players: {
    current: number
    max: number
  }
  cpu: number
  memory: number
  storage: number
  uptime: string
  serverProperties: Record<string, string>
  enableMods: boolean
  mods: string[]
  startupCommands: string
  backupEnabled: boolean
  backupSchedule: string
  autoRestart: boolean
  restartSchedule: string
  createdAt: string
  updatedAt?: string
}

export type ActivityType =
  | "server_start"
  | "server_stop"
  | "server_restart"
  | "server_create"
  | "server_delete"
  | "backup"
  | "update"
  | "error"
  | "user_login"
  | "user_logout"
  | "user_registration"

export type Activity = {
  id: string
  type: ActivityType
  message: string
  server?: string
  serverId?: string
  user?: string
  time: string
}

// In-memory stores
const servers: Server[] = []
const activities: Activity[] = []

// Server methods
export function getServers() {
  return [...servers]
}

export function getServerById(id: string) {
  return servers.find((server) => server.id === id)
}

export function createServer(data: ServerFormData): Server {
  const newServer: Server = {
    id: `server-${Date.now()}`,
    name: data.name,
    gameType: data.gameType,
    description: data.description,
    status: "starting",
    version: data.version,
    port: data.port,
    maxPlayers: data.maxPlayers,
    players: {
      current: 0,
      max: data.maxPlayers,
    },
    cpu: 0,
    memory: 0,
    storage: data.storage,
    uptime: "0m",
    serverProperties: data.serverProperties,
    enableMods: data.enableMods,
    mods: data.mods,
    startupCommands: data.startupCommands,
    backupEnabled: data.backupEnabled,
    backupSchedule: data.backupSchedule,
    autoRestart: data.autoRestart,
    restartSchedule: data.restartSchedule,
    createdAt: new Date().toISOString(),
  }

  servers.push(newServer)

  // Add activity
  addActivity({
    type: "server_create",
    message: `Server "${newServer.name}" created`,
    server: newServer.name,
    serverId: newServer.id,
  })

  // Simulate server starting
  setTimeout(() => {
    const server = servers.find((s) => s.id === newServer.id)
    if (server) {
      server.status = "online"

      // Add random players
      server.players.current = Math.floor(Math.random() * server.players.max)

      // Add random CPU and memory usage
      server.cpu = Math.floor(Math.random() * 50) + 10
      server.memory = Math.floor(Math.random() * 50) + 10

      // Add activity
      addActivity({
        type: "server_start",
        message: `Server "${server.name}" is now online`,
        server: server.name,
        serverId: server.id,
      })
    }
  }, 5000)

  return newServer
}

export function updateServer(id: string, data: Partial<Server>): Server | null {
  const serverIndex = servers.findIndex((s) => s.id === id)
  if (serverIndex === -1) return null

  const updatedServer = {
    ...servers[serverIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  servers[serverIndex] = updatedServer
  return updatedServer
}

export function deleteServer(id: string): boolean {
  const serverIndex = servers.findIndex((s) => s.id === id)
  if (serverIndex === -1) return false

  const server = servers[serverIndex]
  servers.splice(serverIndex, 1)

  // Add activity
  addActivity({
    type: "server_delete",
    message: `Server "${server.name}" deleted`,
    server: server.name,
  })

  return true
}

export function startServer(id: string): boolean {
  const server = servers.find((s) => s.id === id)
  if (!server || server.status === "online" || server.status === "starting") return false

  server.status = "starting"

  // Add activity
  addActivity({
    type: "server_start",
    message: `Starting server "${server.name}"`,
    server: server.name,
    serverId: server.id,
  })

  // Simulate server starting
  setTimeout(() => {
    server.status = "online"
    server.players.current = Math.floor(Math.random() * server.players.max)
    server.cpu = Math.floor(Math.random() * 50) + 10
    server.memory = Math.floor(Math.random() * 50) + 10

    // Add activity
    addActivity({
      type: "server_start",
      message: `Server "${server.name}" is now online`,
      server: server.name,
      serverId: server.id,
    })
  }, 3000)

  return true
}

export function stopServer(id: string): boolean {
  const server = servers.find((s) => s.id === id)
  if (!server || server.status === "offline" || server.status === "stopping") return false

  server.status = "stopping"

  // Add activity
  addActivity({
    type: "server_stop",
    message: `Stopping server "${server.name}"`,
    server: server.name,
    serverId: server.id,
  })

  // Simulate server stopping
  setTimeout(() => {
    server.status = "offline"
    server.players.current = 0
    server.cpu = 0
    server.memory = 0
    server.uptime = "0m"

    // Add activity
    addActivity({
      type: "server_stop",
      message: `Server "${server.name}" is now offline`,
      server: server.name,
      serverId: server.id,
    })
  }, 3000)

  return true
}

export function restartServer(id: string): boolean {
  const server = servers.find((s) => s.id === id)
  if (!server || server.status === "offline" || server.status === "restarting") return false

  server.status = "restarting"

  // Add activity
  addActivity({
    type: "server_restart",
    message: `Restarting server "${server.name}"`,
    server: server.name,
    serverId: server.id,
  })

  // Simulate server restarting
  setTimeout(() => {
    server.status = "online"
    server.players.current = Math.floor(Math.random() * server.players.max)
    server.cpu = Math.floor(Math.random() * 50) + 10
    server.memory = Math.floor(Math.random() * 50) + 10

    // Add activity
    addActivity({
      type: "server_restart",
      message: `Server "${server.name}" has been restarted`,
      server: server.name,
      serverId: server.id,
    })
  }, 5000)

  return true
}

export function backupServer(id: string): boolean {
  const server = servers.find((s) => s.id === id)
  if (!server) return false

  // Add activity
  addActivity({
    type: "backup",
    message: `Backup created for server "${server.name}"`,
    server: server.name,
    serverId: server.id,
  })

  return true
}

// Activity methods
export function getActivities() {
  return [...activities]
}

export function addActivity(data: Omit<Activity, "id" | "time">): Activity {
  const newActivity: Activity = {
    id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    time: new Date().toISOString(),
    ...data,
  }

  activities.unshift(newActivity)

  // Keep only the last 100 activities
  if (activities.length > 100) {
    activities.pop()
  }

  return newActivity
}

// Metrics methods
export function getSystemMetrics() {
  // Calculate system-wide metrics
  const totalServers = servers.length
  const onlineServers = servers.filter((s) => s.status === "online").length
  const offlineServers = servers.filter((s) => s.status === "offline").length

  // Calculate total players across all servers
  const activeUsers = servers.reduce((total, server) => {
    return total + (server.players?.current || 0)
  }, 0)

  // Calculate average CPU and memory usage
  let totalCpu = 0
  let totalMemory = 0
  let serverCount = 0

  servers.forEach((server) => {
    if (server.status === "online") {
      totalCpu += server.cpu || 0
      totalMemory += server.memory || 0
      serverCount++
    }
  })

  const cpuUsage = serverCount > 0 ? Math.round(totalCpu / serverCount) : 0
  const memoryUsage = serverCount > 0 ? Math.round(totalMemory / serverCount) : 0

  return {
    totalServers,
    onlineServers,
    offlineServers,
    activeUsers,
    cpuUsage,
    memoryUsage,
    timestamp: new Date().toISOString(),
  }
}

// Simulation for updating server metrics
export function startMetricsSimulation() {
  // Update server metrics every 10 seconds
  setInterval(() => {
    servers.forEach((server) => {
      if (server.status === "online") {
        // Update CPU and memory with some random fluctuation
        server.cpu = Math.min(Math.max(server.cpu + (Math.random() * 10 - 5), 5), 95)
        server.memory = Math.min(Math.max(server.memory + (Math.random() * 10 - 5), 5), 95)

        // Occasionally change player count
        if (Math.random() > 0.7) {
          const change = Math.floor(Math.random() * 3) - 1 // -1, 0, or 1
          server.players.current = Math.min(Math.max(server.players.current + change, 0), server.players.max)
        }

        // Update uptime
        const createdDate = new Date(server.createdAt)
        const now = new Date()
        const uptimeMs = now.getTime() - createdDate.getTime()
        const uptimeMinutes = Math.floor(uptimeMs / 60000)

        if (uptimeMinutes < 60) {
          server.uptime = `${uptimeMinutes}m`
        } else if (uptimeMinutes < 1440) {
          server.uptime = `${Math.floor(uptimeMinutes / 60)}h ${uptimeMinutes % 60}m`
        } else {
          server.uptime = `${Math.floor(uptimeMinutes / 1440)}d ${Math.floor((uptimeMinutes % 1440) / 60)}h`
        }
      }
    })
  }, 10000)
}

// Start the metrics simulation
startMetricsSimulation()
