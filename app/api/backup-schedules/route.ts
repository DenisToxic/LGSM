import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getBackupSchedules, createBackupSchedule } from "@/lib/backup-store"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const serverId = searchParams.get("serverId")

  const schedules = getBackupSchedules(serverId || undefined)
  return NextResponse.json(schedules)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.serverId) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 })
    }

    const schedule = createBackupSchedule(body)
    return NextResponse.json(schedule)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create backup schedule" }, { status: 500 })
  }
}
