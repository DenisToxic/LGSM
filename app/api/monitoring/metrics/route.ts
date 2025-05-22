import { NextResponse } from "next/server"
import { getServerMetricsHistory } from "@/lib/monitoring-store"
import type { TimeRange } from "@/lib/monitoring-store"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const serverId = url.searchParams.get("serverId")
  const timeRange = (url.searchParams.get("timeRange") as TimeRange) || "24h"
  const startDate = url.searchParams.get("startDate") || undefined
  const endDate = url.searchParams.get("endDate") || undefined

  if (!serverId) {
    return NextResponse.json({ error: "Server ID is required" }, { status: 400 })
  }

  const metrics = getServerMetricsHistory(serverId, timeRange, startDate, endDate)

  if (!metrics) {
    return NextResponse.json({ error: "Server metrics not found" }, { status: 404 })
  }

  return NextResponse.json(metrics)
}
