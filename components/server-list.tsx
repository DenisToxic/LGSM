"use client"

import { useState, useEffect } from "react"
import {
  MoreHorizontal,
  Play,
  Square,
  RefreshCw,
  Download,
  Terminal,
  Settings,
  Trash2,
  Plus,
  ServerOff,
  Loader2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { ServerCreationWizard } from "@/components/server-creation-wizard"
import { useServers } from "@/lib/hooks/use-servers"
import { useBackups } from "@/lib/hooks/use-backups"
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

// Add WebSocket context import
import { useWebSocket } from "@/lib/websocket-context"
import { useRouter } from "next/navigation"

type ServerType = "minecraft" | "csgo" | "valheim" | "terraria" | "rust" | "custom"

type Server = {
  id: string
  name: string
  gameType: ServerType
  status: "online" | "offline" | "starting" | "stopping" | "restarting"
  players: {
    current: number
    max: number
  }
  cpu: number
  memory: number
  uptime: string
  version: string
}

const getStatusColor = (status: Server["status"]) => {
  switch (status) {
    case "online":
      return "bg-green-500"
    case "offline":
      return "bg-red-500"
    case "starting":
      return "bg-blue-500"
    case "stopping":
      return "bg-yellow-500"
    case "restarting":
      return "bg-purple-500"
    default:
      return "bg-gray-500"
  }
}

const getStatusBadge = (status: Server["status"]) => {
  switch (status) {
    case "online":
      return (
        <Badge variant="outline" className="border-green-500 text-green-500">
          Online
        </Badge>
      )
    case "offline":
      return (
        <Badge variant="outline" className="border-red-500 text-red-500">
          Offline
        </Badge>
      )
    case "starting":
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          Starting
        </Badge>
      )
    case "stopping":
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-500">
          Stopping
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

export function ServerList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [serverToDelete, setServerToDelete] = useState<string | null>(null)
  const router = useRouter()

  const { servers, isLoading, isError, deleteServer, performServerAction } = useServers()
  const { createBackup } = useBackups()

  // Inside the ServerList component, add the WebSocket context
  const { isConnected, joinServerRoom, leaveServerRoom } = useWebSocket()

  // Add useEffect to join server rooms for real-time updates
  useEffect(() => {
    if (isConnected && servers.length > 0) {
      // Join rooms for all servers to get updates
      servers.forEach((server) => {
        joinServerRoom(server.id)
      })

      // Clean up when component unmounts
      return () => {
        servers.forEach((server) => {
          leaveServerRoom(server.id)
        })
      }
    }
  }, [isConnected, servers, joinServerRoom, leaveServerRoom])

  const handleServerAction = (action: "start" | "stop" | "restart" | "backup", serverId: string) => {
    if (action === "backup") {
      createBackup(serverId)
    } else {
      performServerAction(serverId, action)
    }
  }

  const confirmDelete = (serverId: string) => {
    setServerToDelete(serverId)
  }

  const handleDelete = () => {
    if (serverToDelete) {
      deleteServer(serverToDelete)
      setServerToDelete(null)
    }
  }

  const cancelDelete = () => {
    setServerToDelete(null)
  }

  const navigateToConsole = (serverId: string) => {
    router.push(`/console?serverId=${serverId}`)
  }

  const filteredServers = servers.filter(
    (server) =>
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.gameType.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isError) {
    return (
      <Card className="flex flex-col items-center justify-center p-10 text-center">
        <CardTitle className="text-xl mb-2">Error Loading Servers</CardTitle>
        <CardDescription className="mb-6">
          There was a problem loading your servers. Please try again later.
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
          placeholder="Search servers..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={() => setIsWizardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Server
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading servers...</span>
        </div>
      ) : servers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <ServerOff className="h-16 w-16 text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No Servers Found</CardTitle>
          <CardDescription className="mb-6">
            You don't have any game servers yet. Create your first server to get started.
          </CardDescription>
          <Button onClick={() => setIsWizardOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Server
          </Button>
        </Card>
      ) : filteredServers.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <CardTitle className="text-xl mb-2">No Matching Servers</CardTitle>
          <CardDescription>No servers match your search criteria. Try a different search term.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredServers.map((server) => (
            <Card key={server.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`h-2 w-2 rounded-full ${getStatusColor(server.status)}`} />
                    <CardTitle className="text-lg">{server.name}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Server Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleServerAction("start", server.id)}
                        disabled={server.status === "online" || server.status === "starting"}
                      >
                        <Play className="mr-2 h-4 w-4" />
                        <span>Start</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleServerAction("stop", server.id)}
                        disabled={server.status === "offline" || server.status === "stopping"}
                      >
                        <Square className="mr-2 h-4 w-4" />
                        <span>Stop</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleServerAction("restart", server.id)}
                        disabled={server.status === "offline" || server.status === "restarting"}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        <span>Restart</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => navigateToConsole(server.id)}>
                        <Terminal className="mr-2 h-4 w-4" />
                        <span>Console</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleServerAction("backup", server.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Backup</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-500" onClick={() => confirmDelete(server.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Delete</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="flex items-center justify-between pt-1">
                  <span className="capitalize">{server.gameType}</span>
                  {getStatusBadge(server.status)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Players</p>
                      <p className="text-sm font-medium">
                        {server.players.current}/{server.players.max}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Uptime</p>
                      <p className="text-sm font-medium">{server.uptime}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Version</p>
                      <p className="text-sm font-medium">{server.version}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">CPU</span>
                        <span className="font-medium">{server.cpu}%</span>
                      </div>
                      <Progress value={server.cpu} className="h-1" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Memory</span>
                        <span className="font-medium">{server.memory}%</span>
                      </div>
                      <Progress value={server.memory} className="h-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ServerCreationWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />

      <AlertDialog open={!!serverToDelete} onOpenChange={cancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this server?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the server and all associated data.
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
