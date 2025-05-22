import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { restoreBackup } from "@/lib/backup-store"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const success = restoreBackup(id)

  if (!success) {
    return NextResponse.json({ error: "Failed to restore backup" }, { status: 400 })
  }

  return NextResponse.json({ success: true, id })
}
