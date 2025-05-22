"use client"

import { useState } from "react"
import { useDockerContainers } from "@/lib/hooks/use-docker-containers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
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
import { CreateContainerDialog } from "@/components/docker/create-container-dialog"
import { ContainerLogsDialog } from "@/components/docker/container-logs-dialog"
import { Play, Square, RefreshCw, Trash2, Plus, MoreHorizontal, FileText, Loader2, Box } from "lucide-react"
import type { DockerContainer, DockerContainerStatus } from "@/lib/docker/docker-client"

const getStatusColor = (status: DockerContainerStatus) => {
  switch (status) {
    case "running":
      return "bg-green-500"
    case "exited":
      return "bg-red-500"
    case "created":
      return "bg-blue-500"
    case "paused":
      return "bg-yellow-500"
    case "restarting":
      return "bg-purple-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusBadge = (status: DockerContainerStatus) => {
  switch (status) {
    case "running":
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Running
        </Badge>
      )
    case "exited":
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          Exited
        </Badge>
      )
    case "created":
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          Created
        </Badge>
      )
    case "paused":
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          Paused
        </Badge>
      )
    case "restarting":
      return (
        <Badge variant="outline" className="border-purple-500 text-purple-500">
          Restarting
        </Badge>
      )
    default:
      return <Badge variant="outline">Unknown</Badge>
  }
}

export function ContainerList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [containerToDelete, setContainerToDelete] = useState<string | null>(null)
  const [containerForLogs, setContainerForLogs] = useState<DockerContainer | null>(null)

  const { containers, isLoading, isError, deleteContainer, performContainerAction } = useDockerContainers()

  const confirmDelete = (containerId: string) => {
    setContainerToDelete(containerId)
  }

  const handleDelete = () => {
    if (containerToDelete) {
      deleteContainer(containerToDelete)
      setContainerToDelete(null)
    }
  }

  const cancelDelete = () => {
    setContainerToDelete(null)
  }

  const viewLogs = (container: DockerContainer) => {
    setContainerForLogs(container)
  }

  const filteredContainers = containers.filter(
    (container) =>
      container.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      container.image.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isError) {
    return (
      <Card className="flex flex-col items-center justify-center p-10 text-center">
        <CardTitle className="text-xl mb-2">Error Loading Containers</CardTitle>
        <CardDescription className="mb-6">
          There was a problem loading your Docker containers. Please try again later.
        </CardDescription>
        <Button onClick={() => window.location.reload()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search containers..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Container
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading containers...</span>
        </div>
      ) : containers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <Box className="h-16 w-16 text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No Containers Found</CardTitle>
          <CardDescription className="mb-6">
            You don't have any Docker containers yet. Create your first container to get started.
          </CardDescription>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Container
          </Button>
        </Card>
      ) : filteredContainers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <CardTitle className="text-xl mb-2">No Matching Containers</CardTitle>
          <CardDescription>No containers match your search criteria. Try a different search term.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredContainers.map((container) => (
            <Card key={container.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(container.status)}`} />
                    <CardTitle className="text-lg">{container.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Container Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => performContainerAction(container.id, "start")}
                        disabled={container.status === "running"}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        <span>Start</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => performContainerAction(container.id, "stop")}
                        disabled={container.status !== "running"}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        <span>Stop</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => performContainerAction(container.id, "restart")}
                        disabled={container.status !== "running"}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>Restart</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => viewLogs(container)}>
                        <FileText className="mr-2 h-4 w-4" />
                        <span>View Logs</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-500"
                        onClick={() => confirmDelete(container.id)}
                        disabled={container.status === "running"}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="flex items-center justify-between pt-1">
                  <span className="truncate max-w-[200px]">{container.image}</span>
                  {getStatusBadge(container.status)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">{new Date(container.created).toLocaleDateString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Ports</p>
                      <p className="text-sm font-medium">{Object.values(container.ports).join(", ") || "None"}</p>
                    </div>
                  </div>

                  {container.status === "running" && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">CPU</span>
                          <span className="font-medium">{container.stats.cpu}%</span>
                        </div>
                        <Progress value={container.stats.cpu} className="h-1" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Memory</span>
                          <span className="font-medium">{container.stats.memory.percent}%</span>
                        </div>
                        <Progress value={container.stats.memory.percent} className="h-1" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateContainerDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />

      {containerForLogs && (
        <ContainerLogsDialog
          container={containerForLogs}
          open={!!containerForLogs}
          onOpenChange={(open) => !open && setContainerForLogs(null)}
        />
      )}

      <AlertDialog open={!!containerToDelete} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this container?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the container and all associated data that is
              not stored in volumes.
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
    </div>
  )
}
