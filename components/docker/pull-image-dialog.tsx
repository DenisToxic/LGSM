"use client"

import { useState } from "react"
import { useDockerImages } from "@/lib/hooks/use-docker-images"
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

interface PullImageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PullImageDialog({ open, onOpenChange }: PullImageDialogProps) {
  const { pullImage, isPulling } = useDockerImages()
  const [repository, setRepository] = useState("")
  const [tag, setTag] = useState("latest")

  const handlePullImage = async () => {
    try {
      await pullImage(repository, tag)
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to pull image:", error)
    }
  }

  const resetForm = () => {
    setRepository("")
    setTag("latest")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pull Docker Image</DialogTitle>
          <DialogDescription>Enter the repository and tag of the Docker image you want to pull.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="repository">Repository</Label>
            <Input
              id="repository"
              placeholder="itzg/minecraft-server"
              value={repository}
              onChange={(e) => setRepository(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tag">Tag</Label>
            <Input id="tag" placeholder="latest" value={tag} onChange={(e) => setTag(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePullImage} disabled={isPulling || !repository}>
            {isPulling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Pull Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
