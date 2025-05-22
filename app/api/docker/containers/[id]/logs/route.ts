import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { dockerClient } from "@/lib/docker/docker-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const logs = await dockerClient.getContainerLogs(id)

    if (!logs) {
      return NextResponse.json({ error: "Container not found or logs unavailable" }, { status: 404 })
    }

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error getting container logs:", error)
    return NextResponse.json({ error: "Failed to get container logs" }, { status: 500 })
  }
}
