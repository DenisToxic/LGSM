"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { useBackupSchedules } from "@/lib/hooks/use-backup-schedules"
import type { BackupSchedule, BackupScheduleFrequency, BackupStorageType } from "@/lib/backup-store"

interface EditBackupScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: BackupSchedule
}

export function EditBackupScheduleDialog({ open, onOpenChange, schedule }: EditBackupScheduleDialogProps) {
  const [frequency, setFrequency] = useState<BackupScheduleFrequency>(schedule.frequency)
  const [cronExpression, setCronExpression] = useState<string>(schedule.cronExpression)
  const [retention, setRetention] = useState<number>(schedule.retention)
  const [enabled, setEnabled] = useState<boolean>(schedule.enabled)
  const [storageType, setStorageType] = useState<BackupStorageType>(schedule.storageType)

  const { updateBackupSchedule } = useBackupSchedules()

  // Update state when schedule changes
  useEffect(() => {
    setFrequency(schedule.frequency)
    setCronExpression(schedule.cronExpression)
    setRetention(schedule.retention)
    setEnabled(schedule.enabled)
    setStorageType(schedule.storageType)
  }, [schedule])

  const handleFrequencyChange = (value: string) => {
    const freq = value as BackupScheduleFrequency
    setFrequency(freq)

    // Set default cron expression based on frequency
    switch (freq) {
      case "hourly":
        setCronExpression("0 * * * *")
        break
      case "daily":
        setCronExpression("0 0 * * *")
        break
      case "weekly":
        setCronExpression("0 0 * * 0")
        break
      case "monthly":
        setCronExpression("0 0 1 * *")
        break
      case "custom":
        // Keep current expression for custom
        break
    }
  }

  const handleSubmit = async () => {
    try {
      await updateBackupSchedule(schedule.id, {
        frequency,
        cronExpression,
        retention,
        enabled,
        storageType,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update backup schedule:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Backup Schedule</DialogTitle>
          <DialogDescription>Modify the automatic backup schedule for your game server.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Backup Frequency</Label>
            <Select value={frequency} onValueChange={handleFrequencyChange}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">Hourly</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="cronExpression">Cron Expression</Label>
              <Input
                id="cronExpression"
                placeholder="0 0 * * *"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use cron syntax: minute hour day-of-month month day-of-week
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="retention">Retention (Number of backups to keep)</Label>
            <Input
              id="retention"
              type="number"
              min={1}
              max={100}
              value={retention}
              onChange={(e) => setRetention(Number.parseInt(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="storage">Storage Type</Label>
            <Select value={storageType} onValueChange={(value) => setStorageType(value as BackupStorageType)}>
              <SelectTrigger id="storage">
                <SelectValue placeholder="Select storage type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Storage</SelectItem>
                <SelectItem value="cloud-s3">AWS S3</SelectItem>
                <SelectItem value="cloud-gcs">Google Cloud Storage</SelectItem>
                <SelectItem value="cloud-azure">Azure Blob Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="enabled">Enable Schedule</Label>
            <Switch id="enabled" checked={enabled} onCheckedChange={setEnabled} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
