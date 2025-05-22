import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { dockerClient } from "@/lib/docker/docker-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const container = await dockerClient.getContainer(id)

    if (!container) {
      return NextResponse.json({ error: "Container not found" }, { status: 404 })
    }

    return NextResponse.json(container)
  } catch (error) {
    console.error("Error getting container:", error)
    return NextResponse.json({ error: "Failed to get container" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const success = await dockerClient.removeContainer(id)

    if (!success) {
      return NextResponse.json({ error: "Container not found" }, { status: 404 })
    }

    // Emit WebSocket event
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/socket/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "container_removed",
        data: { id },
      }),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing container:", error)
    return NextResponse.json({ error: "Failed to remove container" }, { status: 500 })
  }
}
