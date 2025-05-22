import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { startServer, stopServer, restartServer, backupServer } from "@/lib/server-store"

// Action validation schema
const actionSchema = z.object({
  action: z.enum(["start", "stop", "restart", "backup"]),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Validate the request body
    const { action } = actionSchema.parse(body)

    let success = false
    let message = ""

    // Process the action
    switch (action) {
      case "start":
        success = startServer(id)
        message = success ? "Server start initiated" : "Failed to start server"
        break

      case "stop":
        success = stopServer(id)
        message = success ? "Server stop initiated" : "Failed to stop server"
        break

      case "restart":
        success = restartServer(id)
        message = success ? "Server restart initiated" : "Failed to restart server"
        break

      case "backup":
        success = backupServer(id)
        message = success ? "Server backup created" : "Failed to create backup"
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!success) {
      return NextResponse.json({ error: message }, { status: 400 })
    }

    // Emit Socket.IO event for the action
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/socket/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: `server_${action}`,
        data: { id, action, message },
        room: `server:${id}`,
      }),
    })

    return NextResponse.json({
      success: true,
      message,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}
