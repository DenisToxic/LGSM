"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, MoreVertical, Plus, AlertTriangle } from "lucide-react"
import { useThresholds } from "@/lib/hooks/use-thresholds"
import { CreateThresholdDialog } from "@/components/monitoring/create-threshold-dialog"
import { EditThresholdDialog } from "@/components/monitoring/edit-threshold-dialog"
import { useServers } from "@/lib/hooks/use-servers"
import type { MetricThreshold, MetricSeverity } from "@/lib/monitoring-store"

export function ThresholdsList() {
  const { thresholds, isLoading, updateThreshold, deleteThreshold } = useThresholds()
  const { servers } = useServers()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [thresholdToEdit, setThresholdToEdit] = useState<MetricThreshold | null>(null)
  const [thresholdToDelete, setThresholdToDelete] = useState<string | null>(null)

  if (isLoading) {
    return <ThresholdsListSkeleton />
  }

  const handleToggleEnabled = (id: string, currentValue: boolean) => {
    updateThreshold(id, { enabled: !currentValue })
  }

  const confirmDelete = (thresholdId: string) => {
    setThresholdToDelete(thresholdId)
  }

  const handleDelete = () => {
    if (thresholdToDelete) {
      deleteThreshold(thresholdToDelete)
      setThresholdToDelete(null)
    }
  }

  const cancelDelete = () => {
    setThresholdToDelete(null)
  }

  const handleEdit = (threshold: MetricThreshold) => {
    setThresholdToEdit(threshold)
  }

  const getMetricTypeLabel = (metricType: string) => {
    switch (metricType) {
      case "cpu":
        return "CPU Usage"
      case "memory":
        return "Memory Usage"
      case "players":
        return "Players"
      case "network":
        return "Network I/O"
      case "disk":
        return "Disk Usage"
      case "uptime":
        return "Uptime"
      default:
        return metricType
    }
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

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alert Thresholds</CardTitle>
              <CardDescription>Configure when alerts are triggered</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Threshold
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {thresholds.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <AlertTriangle className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-4">No alert thresholds configured</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Threshold
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {thresholds.map((threshold) => (
                <Card key={threshold.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{getMetricTypeLabel(threshold.metricType)}</h4>
                          {getSeverityBadge(threshold.severity)}
                        </div>
                        <p className="text-sm">
                          Trigger when value is {getOperatorString(threshold.operator)} {threshold.value}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Applies to:{" "}
                          {threshold.serverId
                            ? servers.find((s) => s.id === threshold.serverId)?.name || "Unknown server"
                            : "All servers"}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={threshold.enabled}
                          onCheckedChange={() => handleToggleEnabled(threshold.id, threshold.enabled)}
                        />

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Threshold Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(threshold)}>
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500" onClick={() => confirmDelete(threshold.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreateThresholdDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} servers={servers} />

      {thresholdToEdit && (
        <EditThresholdDialog
          threshold={thresholdToEdit}
          open={!!thresholdToEdit}
          onOpenChange={(open) => !open && setThresholdToEdit(null)}
          servers={servers}
        />
      )}

      <AlertDialog open={!!thresholdToDelete} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this threshold?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the alert threshold and prevent any further
              alerts from being generated based on it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ThresholdsListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-36" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-10 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  )
}
