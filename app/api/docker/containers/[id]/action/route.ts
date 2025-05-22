import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { dockerClient } from "@/lib/docker/docker-client"
import { z } from "zod"

// Action schema
const actionSchema = z.object({
  action: z.enum(["start", "stop", "restart"]),
})

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Validate request body
    const { action } = actionSchema.parse(body)

    let success = false

    // Perform action
    switch (action) {
      case "start":
        success = await dockerClient.startContainer(id)
        break
      case "stop":
        success = await dockerClient.stopContainer(id)
        break
      case "restart":
        success = await dockerClient.restartContainer(id)
        break
    }

    if (!success) {
      return NextResponse.json({ error: "Container not found or action failed" }, { status: 404 })
    }

    // Get updated container
    const container = await dockerClient.getContainer(id)

    // Emit WebSocket event
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/socket/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: `container_${action}ed`,
        data: container,
      }),
    })

    return NextResponse.json({ success: true, container })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    console.error(`Error performing container action:`, error)
    return NextResponse.json({ error: "Failed to perform container action" }, { status: 500 })
  }
}
