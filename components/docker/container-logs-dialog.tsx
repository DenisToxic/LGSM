"use client"

import { useEffect, useState } from "react"
import { useDockerContainers } from "@/lib/hooks/use-docker-containers"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, RefreshCw } from "lucide-react"
import type { DockerContainer } from "@/lib/docker/docker-client"

interface ContainerLogsDialogProps {
  container: DockerContainer
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ContainerLogsDialog({ container, open, onOpenChange }: ContainerLogsDialogProps) {
  const { getContainerLogs } = useDockerContainers()
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLogs = async () => {
    setIsLoading(true)
    try {
      const containerLogs = await getContainerLogs(container.id)
      setLogs(containerLogs)
    } catch (error) {
      console.error("Failed to fetch container logs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      fetchLogs()
    }
  }, [open, container.id])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Container Logs: {container.name}</DialogTitle>
          <DialogDescription>View the logs for this container.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 relative">
          <div className="absolute top-2 right-2">
            <Button variant="outline" size="icon" onClick={fetchLogs}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <div className="bg-black text-white p-4 rounded-md h-[400px] overflow-y-auto font-mono text-sm">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                No logs available for this container.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="whitespace-pre-wrap mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
