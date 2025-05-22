import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getBackups, createBackup } from "@/lib/backup-store"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const serverId = searchParams.get("serverId")

  const backups = getBackups(serverId || undefined)
  return NextResponse.json(backups)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serverId, isAutomatic = false, scheduleId } = body

    if (!serverId) {
      return NextResponse.json({ error: "Server ID is required" }, { status: 400 })
    }

    const backup = createBackup(serverId, isAutomatic, scheduleId)

    if (!backup) {
      return NextResponse.json({ error: "Failed to create backup" }, { status: 500 })
    }

    return NextResponse.json(backup)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create backup" }, { status: 500 })
  }
}
