"use client"

import { useState } from "react"
import {
  Trash2,
  MoreHorizontal,
  Calendar,
  Clock,
  HardDrive,
  Cloud,
  ToggleRightIcon as Toggle,
  Edit,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
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
import { useBackupSchedules } from "@/lib/hooks/use-backup-schedules"
import { EditBackupScheduleDialog } from "@/components/backup/edit-backup-schedule-dialog"
import type { BackupSchedule, BackupScheduleFrequency, BackupStorageType } from "@/lib/backup-store"

interface BackupScheduleListProps {
  serverId?: string
}

export function BackupScheduleList({ serverId }: BackupScheduleListProps) {
  const [scheduleToDelete, setScheduleToDelete] = useState<string | null>(null)
  const [scheduleToEdit, setScheduleToEdit] = useState<BackupSchedule | null>(null)

  const { schedules, isLoading, updateBackupSchedule, deleteBackupSchedule } = useBackupSchedules(serverId)

  const confirmDelete = (scheduleId: string) => {
    setScheduleToDelete(scheduleId)
  }

  const handleDelete = () => {
    if (scheduleToDelete) {
      deleteBackupSchedule(scheduleToDelete)
      setScheduleToDelete(null)
    }
  }

  const handleToggleEnabled = (schedule: BackupSchedule) => {
    updateBackupSchedule(schedule.id, { enabled: !schedule.enabled })
  }

  const getFrequencyLabel = (frequency: BackupScheduleFrequency): string => {
    switch (frequency) {
      case "hourly":
        return "Hourly"
      case "daily":
        return "Daily"
      case "weekly":
        return "Weekly"
      case "monthly":
        return "Monthly"
      case "custom":
        return "Custom"
      default:
        return "Unknown"
    }
  }

  const getStorageIcon = (storageType: BackupStorageType) => {
    switch (storageType) {
      case "local":
        return <HardDrive className="h-4 w-4" />
      case "cloud-s3":
      case "cloud-gcs":
      case "cloud-azure":
        return <Cloud className="h-4 w-4" />
      default:
        return <HardDrive className="h-4 w-4" />
    }
  }

  const getStorageLabel = (storageType: BackupStorageType): string => {
    switch (storageType) {
      case "local":
        return "Local Storage"
      case "cloud-s3":
        return "AWS S3"
      case "cloud-gcs":
        return "Google Cloud Storage"
      case "cloud-azure":
        return "Azure Blob Storage"
      default:
        return "Unknown"
    }
  }

  if (isLoading) {
    return <div>Loading schedules...</div>
  }

  if (schedules.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-10 text-center">
        <p className="text-muted-foreground">No backup schedules found</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
          <div className="col-span-1">Status</div>
          <div className="col-span-3">Server</div>
          <div className="col-span-2">Frequency</div>
          <div className="col-span-2">Schedule</div>
          <div className="col-span-2">Storage</div>
          <div className="col-span-1">Retention</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        <div className="divide-y">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="grid grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-1">
                <Switch checked={schedule.enabled} onCheckedChange={() => handleToggleEnabled(schedule)} />
              </div>
              <div className="col-span-3 font-medium truncate">{schedule.serverId}</div>
              <div className="col-span-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {getFrequencyLabel(schedule.frequency)}
                </Badge>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-mono">{schedule.cronExpression}</span>
              </div>
              <div className="col-span-2 flex items-center gap-1">
                {getStorageIcon(schedule.storageType)}
                <span>{getStorageLabel(schedule.storageType)}</span>
              </div>
              <div className="col-span-1">{schedule.retention} backups</div>
              <div className="col-span-1 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Schedule Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setScheduleToEdit(schedule)}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleEnabled(schedule)}>
                      <Toggle className="mr-2 h-4 w-4" />
                      <span>{schedule.enabled ? "Disable" : "Enable"}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500" onClick={() => confirmDelete(schedule.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={!!scheduleToDelete} onOpenChange={() => setScheduleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this schedule?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the backup schedule.
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

      {scheduleToEdit && (
        <EditBackupScheduleDialog
          open={!!scheduleToEdit}
          onOpenChange={() => setScheduleToEdit(null)}
          schedule={scheduleToEdit}
        />
      )}
    </div>
  )
}
