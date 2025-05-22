"use client"

import { useState } from "react"
import type { ServerFormData } from "@/components/server-creation-wizard"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdvancedSettingsStepProps {
  formData: ServerFormData
  updateFormData: (data: Partial<ServerFormData>) => void
  onNext: () => void
  onBack: () => void
  isLastStep: boolean
}

const backupScheduleOptions = [
  { value: "0 0 * * *", label: "Daily at midnight" },
  { value: "0 0 * * 0", label: "Weekly on Sunday" },
  { value: "0 0 1 * *", label: "Monthly on the 1st" },
  { value: "0 */6 * * *", label: "Every 6 hours" },
  { value: "0 */12 * * *", label: "Every 12 hours" },
  { value: "custom", label: "Custom schedule" },
]

const restartScheduleOptions = [
  { value: "0 4 * * *", label: "Daily at 4 AM" },
  { value: "0 4 * * 0", label: "Weekly on Sunday at 4 AM" },
  { value: "0 */12 * * *", label: "Every 12 hours" },
  { value: "custom", label: "Custom schedule" },
]

export function AdvancedSettingsStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  isLastStep,
}: AdvancedSettingsStepProps) {
  const [newMod, setNewMod] = useState("")
  const [customBackupSchedule, setCustomBackupSchedule] = useState("")
  const [customRestartSchedule, setCustomRestartSchedule] = useState("")

  const addMod = () => {
    if (!newMod.trim()) return
    if (formData.mods.includes(newMod.trim())) return

    updateFormData({ mods: [...formData.mods, newMod.trim()] })
    setNewMod("")
  }

  const removeMod = (mod: string) => {
    updateFormData({ mods: formData.mods.filter((m) => m !== mod) })
  }

  const handleBackupScheduleChange = (value: string) => {
    if (value === "custom") {
      // Don't update the actual schedule yet, just show the custom input
      return
    }
    updateFormData({ backupSchedule: value })
  }

  const handleRestartScheduleChange = (value: string) => {
    if (value === "custom") {
      // Don't update the actual schedule yet, just show the custom input
      return
    }
    updateFormData({ restartSchedule: value })
  }

  const applyCustomBackupSchedule = () => {
    if (!customBackupSchedule.trim()) return
    updateFormData({ backupSchedule: customBackupSchedule.trim() })
  }

  const applyCustomRestartSchedule = () => {
    if (!customRestartSchedule.trim()) return
    updateFormData({ restartSchedule: customRestartSchedule.trim() })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="mods" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mods">Mods & Plugins</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="startup">Startup & Restart</TabsTrigger>
        </TabsList>

        <TabsContent value="mods" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-mods">Enable Mods/Plugins</Label>
            <Switch
              id="enable-mods"
              checked={formData.enableMods}
              onCheckedChange={(checked) => updateFormData({ enableMods: checked })}
            />
          </div>

          {formData.enableMods && (
            <>
              <div className="space-y-2">
                <Label>Mod List</Label>
                <div className="flex flex-wrap gap-2 rounded-md border p-2">
                  {formData.mods.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No mods added yet</p>
                  ) : (
                    formData.mods.map((mod) => (
                      <Badge key={mod} variant="secondary" className="flex items-center gap-1">
                        {mod}
                        <button
                          type="button"
                          onClick={() => removeMod(mod)}
                          className="ml-1 rounded-full hover:bg-muted"
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove {mod}</span>
                        </button>
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="new-mod">Add Mod/Plugin</Label>
                  <Input
                    id="new-mod"
                    placeholder="Enter mod name or URL"
                    value={newMod}
                    onChange={(e) => setNewMod(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={addMod} disabled={!newMod.trim()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Add mods or plugins by name or URL. These will be installed during server setup.
              </p>
            </>
          )}
        </TabsContent>

        <TabsContent value="backups" className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="backup-enabled">Enable Automatic Backups</Label>
            <Switch
              id="backup-enabled"
              checked={formData.backupEnabled}
              onCheckedChange={(checked) => updateFormData({ backupEnabled: checked })}
            />
          </div>

          {formData.backupEnabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="backup-schedule">Backup Schedule</Label>
                <Select
                  value={
                    backupScheduleOptions.some((option) => option.value === formData.backupSchedule)
                      ? formData.backupSchedule
                      : "custom"
                  }
                  onValueChange={handleBackupScheduleChange}
                >
                  <SelectTrigger id="backup-schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {backupScheduleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(!backupScheduleOptions.some((option) => option.value === formData.backupSchedule) ||
                backupScheduleOptions.find((option) => option.value === formData.backupSchedule)?.value ===
                  "custom") && (
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="custom-backup-schedule">Custom Cron Schedule</Label>
                    <Input
                      id="custom-backup-schedule"
                      placeholder="e.g., 0 2 * * *"
                      value={customBackupSchedule || formData.backupSchedule}
                      onChange={(e) => setCustomBackupSchedule(e.target.value)}
                    />
                  </div>
                  <Button variant="outline" onClick={applyCustomBackupSchedule} disabled={!customBackupSchedule.trim()}>
                    Apply
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Backups will be stored according to your system backup settings.
              </p>
            </>
          )}
        </TabsContent>

        <TabsContent value="startup" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="startup-commands">Startup Commands</Label>
            <Textarea
              id="startup-commands"
              placeholder="Enter commands to run on server startup"
              value={formData.startupCommands}
              onChange={(e) => updateFormData({ startupCommands: e.target.value })}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">These commands will be executed when the server starts.</p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <Label htmlFor="auto-restart">Enable Automatic Restarts</Label>
            <Switch
              id="auto-restart"
              checked={formData.autoRestart}
              onCheckedChange={(checked) => updateFormData({ autoRestart: checked })}
            />
          </div>

          {formData.autoRestart && (
            <>
              <div className="space-y-2">
                <Label htmlFor="restart-schedule">Restart Schedule</Label>
                <Select
                  value={
                    restartScheduleOptions.some((option) => option.value === formData.restartSchedule)
                      ? formData.restartSchedule
                      : "custom"
                  }
                  onValueChange={handleRestartScheduleChange}
                >
                  <SelectTrigger id="restart-schedule">
                    <SelectValue placeholder="Select schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {restartScheduleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {(!restartScheduleOptions.some((option) => option.value === formData.restartSchedule) ||
                restartScheduleOptions.find((option) => option.value === formData.restartSchedule)?.value ===
                  "custom") && (
                <div className="flex items-end gap-2">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="custom-restart-schedule">Custom Cron Schedule</Label>
                    <Input
                      id="custom-restart-schedule"
                      placeholder="e.g., 0 4 * * *"
                      value={customRestartSchedule || formData.restartSchedule}
                      onChange={(e) => setCustomRestartSchedule(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={applyCustomRestartSchedule}
                    disabled={!customRestartSchedule.trim()}
                  >
                    Apply
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                The server will automatically restart according to this schedule.
              </p>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
