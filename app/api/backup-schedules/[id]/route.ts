// app/api/backup-schedules/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getBackupScheduleById, updateBackupSchedule, deleteBackupSchedule } from "@/lib/backup-store"

// In Next.js 15, route handlers need to use the exact parameter types expected by the framework
export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id
  const schedule = getBackupScheduleById(id)

  if (!schedule) {
    return NextResponse.json({ error: "Backup schedule not found" }, { status: 404 })
  }

  return NextResponse.json(schedule)
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id
    const body = await request.json()

    const updatedSchedule = updateBackupSchedule(id, body)

    if (!updatedSchedule) {
      return NextResponse.json({ error: "Backup schedule not found" }, { status: 404 })
    }

    return NextResponse.json(updatedSchedule)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update backup schedule" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const id = context.params.id
  const success = deleteBackupSchedule(id)

  if (!success) {
    return NextResponse.json({ error: "Backup schedule not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, id })
}