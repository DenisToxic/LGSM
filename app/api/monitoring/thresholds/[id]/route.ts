import { NextResponse } from "next/server"
import { getThresholdById, updateThreshold, deleteThreshold } from "@/lib/monitoring-store"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const thresholdId = params.id

  const threshold = getThresholdById(thresholdId)

  if (!threshold) {
    return NextResponse.json({ error: "Threshold not found" }, { status: 404 })
  }

  return NextResponse.json(threshold)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const thresholdId = params.id
  const data = await request.json()

  const updatedThreshold = updateThreshold(thresholdId, data)

  if (!updatedThreshold) {
    return NextResponse.json({ error: "Threshold not found" }, { status: 404 })
  }

  return NextResponse.json(updatedThreshold)
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const thresholdId = params.id

  const success = deleteThreshold(thresholdId)

  if (!success) {
    return NextResponse.json({ error: "Threshold not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
