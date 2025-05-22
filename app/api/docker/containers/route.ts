import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { dockerClient } from "@/lib/docker/docker-client"
import { z } from "zod"

// Container creation schema
const containerSchema = z.object({
  name: z.string().min(1),
  image: z.string().min(1),
  ports: z.record(z.string()),
  volumes: z.array(z.string()),
  env: z.array(z.string()),
  restart: z.enum(["no", "always", "on-failure", "unless-stopped"]),
  labels: z.record(z.string()),
  resources: z
    .object({
      cpuShares: z.number().optional(),
      memory: z.number().optional(),
      memorySwap: z.number().optional(),
    })
    .optional(),
  networkMode: z.string().optional(),
})

export async function GET() {
  try {
    const containers = await dockerClient.listContainers()
    return NextResponse.json(containers)
  } catch (error) {
    console.error("Error listing containers:", error)
    return NextResponse.json({ error: "Failed to list containers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = containerSchema.parse(body)

    // Create container
    const container = await dockerClient.createContainer(validatedData)

    // Emit WebSocket event
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/socket/emit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event: "container_created",
        data: container,
      }),
    })

    return NextResponse.json(container, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    console.error("Error creating container:", error)
    return NextResponse.json({ error: "Failed to create container" }, { status: 500 })
  }
}
