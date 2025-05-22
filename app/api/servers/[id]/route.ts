import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerById, updateServer, deleteServer } from "@/lib/server-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const server = getServerById(id)

  if (!server) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 })
  }

  return NextResponse.json(server)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    const updatedServer = updateServer(id, body)

    if (!updatedServer) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 })
    }

    return NextResponse.json(updatedServer)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update server" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const success = deleteServer(id)

  if (!success) {
    return NextResponse.json({ error: "Server not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true, id })
}
