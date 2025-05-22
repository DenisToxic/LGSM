"use client"

import { useState } from "react"
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
import type { Server } from "@/lib/server-store"
import type { BackupScheduleFrequency, BackupStorageType } from "@/lib/backup-store"

interface CreateBackupScheduleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  servers: Server[]
}

export function CreateBackupScheduleDialog({ open, onOpenChange, servers }: CreateBackupScheduleDialogProps) {
  const [selectedServerId, setSelectedServerId] = useState<string>("")
  const [frequency, setFrequency] = useState<BackupScheduleFrequency>("daily")
  const [cronExpression, setCronExpression] = useState<string>("0 0 * * *")
  const [retention, setRetention] = useState<number>(7)
  const [enabled, setEnabled] = useState<boolean>(true)
  const [storageType, setStorageType] = useState<BackupStorageType>("local")

  const { createBackupSchedule, isCreating } = useBackupSchedules()

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
    if (!selectedServerId) return

    try {
      await createBackupSchedule({
        serverId: selectedServerId,
        frequency,
        cronExpression,
        retention,
        enabled,
        storageType,
      })

      onOpenChange(false)
      resetForm()
    } catch (error) {
      console.error("Failed to create backup schedule:", error)
    }
  }

  const resetForm = () => {
    setSelectedServerId("")
    setFrequency("daily")
    setCronExpression("0 0 * * *")
    setRetention(7)
    setEnabled(true)
    setStorageType("local")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm()
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Backup Schedule</DialogTitle>
          <DialogDescription>Set up an automatic backup schedule for your game server.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="server">Select Server</Label>
            <Select value={selectedServerId} onValueChange={setSelectedServerId}>
              <SelectTrigger id="server">
                <SelectValue placeholder="Select a server" />
              </SelectTrigger>
              <SelectContent>
                {servers.map((server) => (
                  <SelectItem key={server.id} value={server.id}>
                    {server.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedServerId || isCreating}>
            {isCreating ? "Creating..." : "Create Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
