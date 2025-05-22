import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This is a helper route to emit Socket.IO events from API routes
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data, room } = body

    // In a real implementation, you would access the Socket.IO instance directly
    // For this example, we're simulating the emission of events

    // Get the Express app instance that has the io object
    const expressApp = (global as any).__express_app

    if (!expressApp) {
      return NextResponse.json({ error: "Socket.IO not initialized" }, { status: 500 })
    }

    const io = expressApp.get("io")

    if (!io) {
      return NextResponse.json({ error: "Socket.IO not initialized" }, { status: 500 })
    }

    // Emit the event to all clients or a specific room
    if (room) {
      io.to(room).emit(event, data)
    } else {
      io.emit(event, data)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error emitting Socket.IO event:", error)
    return NextResponse.json({ error: "Failed to emit event" }, { status: 500 })
  }
}
