import { NextResponse } from "next/server"
import { getThresholds, createThreshold } from "@/lib/monitoring-store"

export async function GET() {
  return NextResponse.json(getThresholds())
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const newThreshold = createThreshold(data)
    return NextResponse.json(newThreshold, { status: 201 })
  } catch (error) {
    console.error("Error creating threshold:", error)
    return NextResponse.json({ error: "Failed to create threshold" }, { status: 500 })
  }
}
