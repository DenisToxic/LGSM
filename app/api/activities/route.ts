import { NextResponse } from "next/server"
import { getActivities } from "@/lib/server-store"

export async function GET() {
  // Get activities
  const activities = getActivities()

  // Format the time for display
  const formattedActivities = activities.map((activity) => {
    const date = new Date(activity.time)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    let formattedTime
    if (diffMins < 60) {
      formattedTime = `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`
    } else if (diffHours < 24) {
      formattedTime = `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    } else {
      formattedTime = `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    }

    return {
      ...activity,
      formattedTime,
    }
  })

  return NextResponse.json(formattedActivities)
}
