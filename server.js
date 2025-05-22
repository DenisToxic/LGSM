// server.js
const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const next = require("next")

// Update the server.js file to use the correct port from environment variables
const port = Number.parseInt(process.env.PORT || "3000", 10)
const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// Track connected clients
const connectedClients = new Set()

// In-memory store for server metrics (in a real app, this would come from a database)
const serverMetrics = {}

app.prepare().then(() => {
  const expressApp = express()
  const server = http.createServer(expressApp)

  // Make sure the Socket.IO server is properly configured for CORS
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_API_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  // Socket.IO connection handler
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`)
    connectedClients.add(socket.id)

    // Send initial connection status
    socket.emit("connection_status", { connected: true })

    // Join rooms for specific data types
    socket.on("join_server", (serverId) => {
      console.log(`Client ${socket.id} joined server room: ${serverId}`)
      socket.join(`server:${serverId}`)
    })

    socket.on("leave_server", (serverId) => {
      console.log(`Client ${socket.id} left server room: ${serverId}`)
      socket.leave(`server:${serverId}`)
    })

    // Handle client disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`)
      connectedClients.delete(socket.id)
    })
  })

  // Make io accessible to our API routes
  expressApp.set("io", io)

  // Fix for Express 5.0.0 - Update any wildcard routes
  // Example of a fixed wildcard route (if you have any)
  expressApp.get("/api/servers/:serverId/logs/:logType(*)/:timestamp?", (req, res) => {
    // This is just an example - replace with your actual route handler
    const { serverId, logType, timestamp } = req.params
    res.json({ serverId, logType, timestamp })
  })

  // Default route handler for Next.js - FIXED for Express 5
  expressApp.all("/:path(*)", (req, res) => {
    return handle(req, res)
  })

  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })

  // Simulate server metrics updates (in a real app, this would come from actual server monitoring)
  setInterval(() => {
    // Get server data from your database or monitoring system
    // For now, we'll use dummy data
    const dummyServerUpdate = {
      id: "server-123",
      status: "online",
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      players: {
        current: Math.floor(Math.random() * 10),
        max: 20,
      },
    }

    // Store the latest metrics
    serverMetrics[dummyServerUpdate.id] = dummyServerUpdate

    // Broadcast to all clients in the server room
    io.to(`server:${dummyServerUpdate.id}`).emit("server_update", dummyServerUpdate)

    // Also broadcast system-wide metrics
    const systemMetrics = {
      timestamp: new Date().toISOString(),
      cpuUsage: Math.floor(Math.random() * 100),
      memoryUsage: Math.floor(Math.random() * 100),
      activeUsers: Math.floor(Math.random() * 50),
      totalServers: Object.keys(serverMetrics).length,
      onlineServers: Object.values(serverMetrics).filter((s) => s.status === "online").length,
    }

    io.emit("system_metrics", systemMetrics)
  }, 5000)

  // Simulate activity updates
  setInterval(() => {
    const activityTypes = ["server_start", "server_stop", "user_login", "backup", "error"]
    const randomType = activityTypes[Math.floor(Math.random() * activityTypes.length)]

    const activity = {
      id: `activity-${Date.now()}`,
      type: randomType,
      message: `Random ${randomType} activity`,
      server: "Example Server",
      serverId: "server-123",
      time: new Date().toISOString(),
      formattedTime: "1 minute ago",
    }

    io.emit("new_activity", activity)
  }, 15000)
})