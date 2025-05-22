import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getBackupById, updateBackup, deleteBackup } from "@/lib/backup-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const backup = getBackupById(id)

  if (!backup) {
    return NextResponse.json({ error: "Backup not found" }, { status: 404 })
  }

  return NextResponse.json(backup)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    const updatedBackup = updateBackup(id, body)

    if (!updatedBackup) {
      return NextResponse.json({ error: "Backup not found" }, { status: 404 })
    }

    return NextResponse.json(updatedBackup)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update backup" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const success = deleteBackup(id)

  if (!success) {
    return NextResponse.json({ error: "Backup not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, id })
}
