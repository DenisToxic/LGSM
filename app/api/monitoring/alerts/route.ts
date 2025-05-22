import { NextResponse } from "next/server"
import { getAlerts, createThreshold, type MetricSeverity } from "@/lib/monitoring-store"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const status = url.searchParams.get("status") as "active" | "acknowledged" | "resolved" | undefined
  const serverId = url.searchParams.get("serverId") || undefined
  const severity = url.searchParams.get("severity") as MetricSeverity | undefined

  const alerts = getAlerts({ status, serverId, severity })

  return NextResponse.json(alerts)
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
