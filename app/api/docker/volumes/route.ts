import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { dockerClient } from "@/lib/docker/docker-client"
import { z } from "zod"

// Volume creation schema
const volumeSchema = z.object({
  name: z.string().min(1),
})

export async function GET() {
  try {
    const volumes = await dockerClient.listVolumes()
    return NextResponse.json(volumes)
  } catch (error) {
    console.error("Error listing volumes:", error)
    return NextResponse.json({ error: "Failed to list volumes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const { name } = volumeSchema.parse(body)

    // Create volume
    const volume = await dockerClient.createVolume(name)

    return NextResponse.json(volume, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    console.error("Error creating volume:", error)
    return NextResponse.json({ error: "Failed to create volume" }, { status: 500 })
  }
}
