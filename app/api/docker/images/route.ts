import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { dockerClient } from "@/lib/docker/docker-client"
import { z } from "zod"

// Image pull schema
const imagePullSchema = z.object({
  repository: z.string().min(1),
  tag: z.string().default("latest"),
})

export async function GET() {
  try {
    const images = await dockerClient.listImages()
    return NextResponse.json(images)
  } catch (error) {
    console.error("Error listing images:", error)
    return NextResponse.json({ error: "Failed to list images" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const { repository, tag } = imagePullSchema.parse(body)

    // Pull image
    const image = await dockerClient.pullImage(repository, tag)

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    console.error("Error pulling image:", error)
    return NextResponse.json({ error: "Failed to pull image" }, { status: 500 })
  }
}
