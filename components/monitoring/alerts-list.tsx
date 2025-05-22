"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Check, Clock } from "lucide-react"
import { useAlerts } from "@/lib/hooks/use-alerts"
import type { MetricSeverity } from "@/lib/monitoring-store"

export function AlertsList() {
  const [filter, setFilter] = useState<"active" | "acknowledged" | "resolved" | "all">("active")

  const { alerts, isLoading, updateAlertStatus } = useAlerts({
    status: filter === "all" ? undefined : filter,
  })

  if (isLoading) {
    return <AlertsListSkeleton />
  }

  const handleUpdateStatus = (alertId: string, status: "acknowledged" | "resolved") => {
    updateAlertStatus(alertId, status)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Server Alerts</CardTitle>
        <CardDescription>Monitor and respond to system alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(value: any) => setFilter(value)} className="space-y-4">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="active" className="relative">
              Active
              {filter !== "active" && alerts.filter((a) => a.status === "active").length > 0 && (
                <Badge variant="destructive" className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs">
                  {alerts.filter((a) => a.status === "active").length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="acknowledged">Acknowledged</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            {alerts.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                {filter === "active"
                  ? "No active alerts. All systems are running normally."
                  : `No ${filter} alerts found.`}
              </div>
            ) : (
              alerts.map((alert) => (
                <AlertItem
                  key={alert.id}
                  alert={alert}
                  onAcknowledge={() => handleUpdateStatus(alert.id, "acknowledged")}
                  onResolve={() => handleUpdateStatus(alert.id, "resolved")}
                />
              ))
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

interface AlertItemProps {
  alert: any
  onAcknowledge: () => void
  onResolve: () => void
}

function AlertItem({ alert, onAcknowledge, onResolve }: AlertItemProps) {
  const getSeverityColor = (severity: MetricSeverity) => {
    switch (severity) {
      case "critical":
        return "bg-red-500"
      case "warning":
        return "bg-yellow-500"
      case "info":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityBadge = (severity: MetricSeverity) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      case "warning":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Warning
          </Badge>
        )
      case "info":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Info
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getOperatorString = (operator: string) => {
    switch (operator) {
      case "gt":
        return ">"
      case "lt":
        return "<"
      case "eq":
        return "="
      case "gte":
        return ">="
      case "lte":
        return "<="
      default:
        return operator
    }
  }

  const statusBadge = () => {
    switch (alert.status) {
      case "active":
        return <Badge variant="destructive">Active</Badge>
      case "acknowledged":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Acknowledged
          </Badge>
        )
      case "resolved":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Resolved
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className={`h-1 ${getSeverityColor(alert.severity)}`} />
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle
                className={`h-4 w-4 ${
                  alert.severity === "critical"
                    ? "text-red-500"
                    : alert.severity === "warning"
                      ? "text-yellow-500"
                      : "text-blue-500"
                }`}
              />
              <h4 className="font-medium">
                {alert.serverName}: {alert.metricType.charAt(0).toUpperCase() + alert.metricType.slice(1)} alert
              </h4>
              {getSeverityBadge(alert.severity)}
              {statusBadge()}
            </div>
            <p className="text-sm text-muted-foreground">
              Current value: {alert.value.toFixed(1)}% {getOperatorString(alert.operator)} threshold: {alert.threshold}%
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" /> Created: {formatTimestamp(alert.createdAt)}
              {alert.acknowledgedAt && ` | Acknowledged: ${formatTimestamp(alert.acknowledgedAt)}`}
              {alert.resolvedAt && ` | Resolved: ${formatTimestamp(alert.resolvedAt)}`}
            </div>
          </div>

          <div className="flex gap-2 mt-2 md:mt-0">
            {alert.status === "active" && (
              <Button size="sm" variant="outline" onClick={onAcknowledge}>
                Acknowledge
              </Button>
            )}
            {(alert.status === "active" || alert.status === "acknowledged") && (
              <Button size="sm" onClick={onResolve}>
                <Check className="mr-2 h-4 w-4" />
                Resolve
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AlertsListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-9 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
