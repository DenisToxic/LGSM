import { NextResponse } from "next/server"
import { getAlertById, updateAlertStatus } from "@/lib/monitoring-store"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const alertId = params.id

  const alert = getAlertById(alertId)

  if (!alert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 })
  }

  return NextResponse.json(alert)
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const alertId = params.id
  const { status } = await request.json()

  if (!["active", "acknowledged", "resolved"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const updatedAlert = updateAlertStatus(alertId, status)

  if (!updatedAlert) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 })
  }

  return NextResponse.json(updatedAlert)
}
