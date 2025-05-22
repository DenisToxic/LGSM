// app/api/socket/route.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  // Your socket route logic
  return NextResponse.json({ status: "Socket API is running" })
}