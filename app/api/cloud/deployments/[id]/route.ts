import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getDeploymentById, cancelDeployment, terminateDeployment } from "@/lib/cloud-deployment-store"

// GET a specific deployment
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const deployment = getDeploymentById(id)

  if (!deployment) {
    return NextResponse.json({ error: "Deployment not found" }, { status: 404 })
  }

  return NextResponse.json(deployment)
}

// POST to perform actions on a deployment
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { action } = body

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    let success = false

    switch (action) {
      case "cancel":
        success = cancelDeployment(id)
        break
      case "terminate":
        success = terminateDeployment(id)
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!success) {
      return NextResponse.json({ error: "Failed to perform action" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to perform action" }, { status: 500 })
  }
}
