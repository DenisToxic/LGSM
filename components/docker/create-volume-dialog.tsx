"use client"

import { useState } from "react"
import { useDockerVolumes } from "@/lib/hooks/use-docker-volumes"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

interface CreateVolumeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVolumeDialog({ open, onOpenChange }: CreateVolumeDialogProps) {
  const { createVolume, isCreating } = useDockerVolumes()
  const [volumeName, setVolumeName] = useState("")

  const handleCreateVolume = async () => {
    try {
      await createVolume(volumeName)
      setVolumeName("")
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create volume:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Volume</DialogTitle>
          <DialogDescription>Create a new Docker volume for persistent data storage.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="volume-name">Volume Name</Label>
            <Input
              id="volume-name"
              placeholder="minecraft-data"
              value={volumeName}
              onChange={(e) => setVolumeName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateVolume} disabled={isCreating || !volumeName}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Volume
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
