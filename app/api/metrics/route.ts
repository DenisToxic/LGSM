import { NextResponse } from "next/server"
import { getSystemMetrics } from "@/lib/server-store"

export async function GET() {
  return NextResponse.json(getSystemMetrics())
}
