"use client"

import { Activity, AlertTriangle, Check, Clock, RefreshCw, Server, User, Loader2 } from "lucide-react"
import { useActivities } from "@/lib/hooks/use-activities"
import { Button } from "@/components/ui/button"
import { useWebSocket } from "@/lib/websocket-context"
import { useEffect, useState } from "react"

type ActivityItem = {
  id: string
  type: "server_start" | "server_stop" | "user_login" | "backup" | "update" | "error"
  server?: string
  user?: string
  message: string
  time: string
  formattedTime: string
}

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "server_start":
      return <Server className="h-4 w-4 text-green-500" />
    case "server_stop":
      return <Server className="h-4 w-4 text-orange-500" />
    case "user_login":
      return <User className="h-4 w-4 text-blue-500" />
    case "backup":
      return <Check className="h-4 w-4 text-green-500" />
    case "update":
      return <RefreshCw className="h-4 w-4 text-blue-500" />
    case "error":
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

export function RecentActivityList() {
  const { activities, isLoading, isError, mutate } = useActivities()
  const { socket, isConnected } = useWebSocket()
  const [newActivityCount, setNewActivityCount] = useState(0)

  // Listen for new activity notifications
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleNewActivity = () => {
      setNewActivityCount((prev) => prev + 1)
    }

    socket.on("new_activity", handleNewActivity)

    return () => {
      socket.off("new_activity", handleNewActivity)
    }
  }, [socket, isConnected])

  // Reset new activity count when activities are refreshed
  useEffect(() => {
    setNewActivityCount(0)
  }, [activities])

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center">
        <AlertTriangle className="h-10 w-10 text-red-500 mb-2" />
        <p className="text-muted-foreground mb-4">Failed to load activity data</p>
        <Button onClick={() => mutate()} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading activity data...</p>
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[200px] text-center">
        <Activity className="h-10 w-10 text-muted-foreground mb-2" />
        <p className="text-muted-foreground">No recent activity</p>
        <p className="text-xs text-muted-foreground mt-1">
          Activity will appear here when you create and manage servers
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {newActivityCount > 0 && (
        <Button variant="outline" size="sm" className="w-full text-primary" onClick={() => mutate()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          {newActivityCount} new {newActivityCount === 1 ? "activity" : "activities"}
        </Button>
      )}

      {activities.map((activity: ActivityItem) => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">{activity.message}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              {activity.server && <span className="font-medium">{activity.server}</span>}
              {activity.user && <span className="font-medium">{activity.user}</span>}
              {(activity.server || activity.user) && <span className="mx-1">•</span>}
              <Clock className="mr-1 h-3 w-3" />
              <span>{activity.formattedTime}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
