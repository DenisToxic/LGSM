import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerById, addActivity } from "@/lib/server-store"

// Simulate console output storage
const consoleOutputStore: Record<string, string[]> = {}

// Initialize console output for a server if it doesn't exist
function initializeConsoleOutput(serverId: string) {
  if (!consoleOutputStore[serverId]) {
    const server = getServerById(serverId)
    if (!server) return false

    consoleOutputStore[serverId] = [
      "[INFO] Starting server...",
      `[INFO] Loading ${server.gameType} server version ${server.version}...`,
      "[INFO] Loading properties...",
      "[INFO] Default game type: SURVIVAL",
      `[INFO] Preparing level "${server.name}"`,
      "[INFO] Preparing start region for dimension minecraft:overworld",
      `[INFO] Done! For help, type "help"`,
    ]
    return true
  }
  return true
}

// Get console output for a server
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const serverId = params.id

  // Initialize console output if it doesn't exist
  initializeConsoleOutput(serverId)

  // Get the server
  const server = getServerById(serverId)
  if (!server) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 })
  }

  // Return the console output
  return NextResponse.json({
    output: consoleOutputStore[serverId] || [],
    serverId,
    serverName: server.name,
  })
}

// Send a command to the server
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const serverId = params.id

  // Get the server
  const server = getServerById(serverId)
  if (!server) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 })
  }

  // Initialize console output if it doesn't exist
  initializeConsoleOutput(serverId)

  // Get the command from the request body
  const body = await request.json()
  const { command } = body

  if (!command || typeof command !== "string") {
    return NextResponse.json({ error: "Invalid command" }, { status: 400 })
  }

  // Process the command and generate a response
  let response: string[] = []

  // Check if the server is online
  if (server.status !== "online") {
    response = ["[ERROR] Server is not running. Start the server first."]
  } else {
    // Process common commands
    switch (command.toLowerCase()) {
      case "help":
        response = [
          "[INFO] Available commands:",
          "[INFO] help - Shows this help message",
          "[INFO] list - Lists all online players",
          "[INFO] stop - Stops the server",
          "[INFO] restart - Restarts the server",
          "[INFO] version - Shows server version",
          "[INFO] seed - Shows the world seed",
          "[INFO] time - Shows the current world time",
          "[INFO] weather - Shows the current weather",
          "[INFO] difficulty - Shows the current difficulty",
          "[INFO] gamemode - Shows the current game mode",
        ]
        break
      case "list":
        response = [`[INFO] There are ${server.players.current} of a max of ${server.players.max} players online:`]
        if (server.players.current > 0) {
          // Generate random player names
          const playerNames = Array.from({ length: server.players.current }, (_, i) => `Player${i + 1}`).join(", ")
          response.push(`[INFO] ${playerNames}`)
        } else {
          response.push("[INFO] No players online")
        }
        break
      case "version":
        response = [`[INFO] This server is running ${server.gameType} version ${server.version}`]
        break
      case "stop":
        response = [
          "[INFO] Stopping the server...",
          "[INFO] Saving chunks for level 'world'",
          "[INFO] Saved the world",
          "[INFO] Stopping server",
        ]
        // Add activity
        addActivity({
          type: "server_stop",
          message: `Server "${server.name}" stopped via console`,
          server: server.name,
          serverId: server.id,
        })
        break
      case "restart":
        response = [
          "[INFO] Restarting the server...",
          "[INFO] Saving chunks for level 'world'",
          "[INFO] Saved the world",
          "[INFO] Stopping server",
          "[INFO] Starting server...",
          "[INFO] Loading properties...",
          "[INFO] Default game type: SURVIVAL",
          `[INFO] Preparing level "world"`,
          `[INFO] Done! For help, type "help"`,
        ]
        // Add activity
        addActivity({
          type: "server_restart",
          message: `Server "${server.name}" restarted via console`,
          server: server.name,
          serverId: server.id,
        })
        break
      case "seed":
        response = [`[INFO] Seed: ${Math.floor(Math.random() * 1000000000)}`]
        break
      case "time":
        const times = ["day", "noon", "sunset", "night", "midnight", "sunrise"]
        response = [`[INFO] The time is ${times[Math.floor(Math.random() * times.length)]}`]
        break
      case "weather":
        const weathers = ["clear", "rain", "thunder"]
        response = [`[INFO] The weather is ${weathers[Math.floor(Math.random() * weathers.length)]}`]
        break
      case "difficulty":
        const difficulties = ["peaceful", "easy", "normal", "hard"]
        response = [`[INFO] The difficulty is ${difficulties[Math.floor(Math.random() * difficulties.length)]}`]
        break
      case "gamemode":
        const gamemodes = ["survival", "creative", "adventure", "spectator"]
        response = [`[INFO] The game mode is ${gamemodes[Math.floor(Math.random() * gamemodes.length)]}`]
        break
      case "clear":
        // Clear the console
        consoleOutputStore[serverId] = ["[INFO] Console cleared."]
        response = []
        break
      default:
        // Handle unknown commands
        if (command.startsWith("/")) {
          // Game-specific commands
          response = [`[INFO] Executed command: ${command}`]
        } else {
          response = [`[ERROR] Unknown command: ${command}`, "[INFO] Use 'help' for a list of commands"]
        }
    }
  }

  // Add the response to the console output
  if (response.length > 0) {
    consoleOutputStore[serverId] = [...consoleOutputStore[serverId], ...response]
  }

  // Emit Socket.IO event for console update
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/socket/emit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      event: "console_update",
      data: {
        serverId,
        command,
        response,
        timestamp: new Date().toISOString(),
      },
      room: `server:${serverId}`,
    }),
  })

  return NextResponse.json({
    success: true,
    response,
  })
}

