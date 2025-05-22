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
import { Textarea } from "@/components/ui/textarea"
import { useBackups } from "@/lib/hooks/use-backups"
import type { Server } from "@/lib/server-store"

interface CreateBackupDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  servers: Server[]
}

export function CreateBackupDialog({ open, onOpenChange, servers }: CreateBackupDialogProps) {
  const [selectedServerId, setSelectedServerId] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const { createBackup, isCreating } = useBackups()

  const handleSubmit = async () => {
    if (!selectedServerId) return

    try {
      await createBackup(selectedServerId)
      onOpenChange(false)
      setSelectedServerId("")
      setNotes("")
    } catch (error) {
      console.error("Failed to create backup:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Backup</DialogTitle>
          <DialogDescription>Create a manual backup of your game server.</DialogDescription>
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
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add notes about this backup"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!selectedServerId || isCreating}>
            {isCreating ? "Creating..." : "Create Backup"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
