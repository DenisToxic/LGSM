import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { getServers, createServer } from "@/lib/server-store"

// Server validation schema
const serverSchema = z.object({
  name: z.string().min(3).max(50),
  gameType: z.enum(["minecraft", "csgo", "valheim", "terraria", "rust", "custom"]),
  description: z.string().optional(),
  version: z.string(),
  port: z.number().int().min(1024).max(65535),
  maxPlayers: z.number().int().min(1),
  serverProperties: z.record(z.string()),
  cpu: z.number().int().min(1),
  memory: z.number().int().min(1),
  storage: z.number().int().min(1),
  enableMods: z.boolean(),
  mods: z.array(z.string()),
  startupCommands: z.string().optional(),
  backupEnabled: z.boolean(),
  backupSchedule: z.string(),
  autoRestart: z.boolean(),
  restartSchedule: z.string(),
})

export async function GET() {
  return NextResponse.json(getServers())
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = serverSchema.parse(body)

    // Create a new server
    const newServer = createServer(validatedData)

    // Get the Socket.IO instance from the server
    // In a real implementation, you would use a more direct method to access the Socket.IO instance
    // This is a simplified example
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/socket/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "server_created",
        data: newServer,
      }),
    })

    return NextResponse.json(newServer, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create server" }, { status: 500 })
  }
}
