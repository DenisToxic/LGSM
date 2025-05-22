"use client"

import { useState } from "react"
import { useDockerContainers } from "@/lib/hooks/use-docker-containers"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Plus, Trash2 } from "lucide-react"
import type { DockerContainerConfig } from "@/lib/docker/docker-client"

interface CreateContainerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateContainerDialog({ open, onOpenChange }: CreateContainerDialogProps) {
  const { createContainer, isCreating } = useDockerContainers()
  const { images, isLoading: isLoadingImages } = useDockerImages()

  const [containerConfig, setContainerConfig] = useState<DockerContainerConfig>({
    name: "",
    image: "",
    ports: {},
    volumes: [],
    env: [],
    restart: "unless-stopped",
    labels: {},
    resources: {},
  })

  const [newPort, setNewPort] = useState({ container: "", host: "" })
  const [newVolume, setNewVolume] = useState("")
  const [newEnv, setNewEnv] = useState({ key: "", value: "" })

  const handleCreateContainer = async () => {
    try {
      await createContainer(containerConfig)
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to create container:", error)
    }
  }

  const resetForm = () => {
    setContainerConfig({
      name: "",
      image: "",
      ports: {},
      volumes: [],
      env: [],
      restart: "unless-stopped",
      labels: {},
      resources: {},
    })
    setNewPort({ container: "", host: "" })
    setNewVolume("")
    setNewEnv({ key: "", value: "" })
  }

  const addPort = () => {
    if (newPort.container && newPort.host) {
      setContainerConfig({
        ...containerConfig,
        ports: {
          ...containerConfig.ports,
          [`${newPort.container}/tcp`]: newPort.host,
        },
      })
      setNewPort({ container: "", host: "" })
    }
  }

  const removePort = (port: string) => {
    const updatedPorts = { ...containerConfig.ports }
    delete updatedPorts[port]
    setContainerConfig({
      ...containerConfig,
      ports: updatedPorts,
    })
  }

  const addVolume = () => {
    if (newVolume) {
      setContainerConfig({
        ...containerConfig,
        volumes: [...containerConfig.volumes, newVolume],
      })
      setNewVolume("")
    }
  }

  const removeVolume = (volume: string) => {
    setContainerConfig({
      ...containerConfig,
      volumes: containerConfig.volumes.filter((v) => v !== volume),
    })
  }

  const addEnv = () => {
    if (newEnv.key && newEnv.value) {
      setContainerConfig({
        ...containerConfig,
        env: [...containerConfig.env, `${newEnv.key}=${newEnv.value}`],
      })
      setNewEnv({ key: "", value: "" })
    }
  }

  const removeEnv = (env: string) => {
    setContainerConfig({
      ...containerConfig,
      env: containerConfig.env.filter((e) => e !== env),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Container</DialogTitle>
          <DialogDescription>Configure and create a new Docker container for your game server.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="ports">Ports</TabsTrigger>
            <TabsTrigger value="volumes">Volumes</TabsTrigger>
            <TabsTrigger value="env">Environment</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="container-name">Container Name</Label>
                <Input
                  id="container-name"
                  placeholder="my-game-server"
                  value={containerConfig.name}
                  onChange={(e) => setContainerConfig({ ...containerConfig, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="container-image">Image</Label>
                <Select
                  value={containerConfig.image}
                  onValueChange={(value) => setContainerConfig({ ...containerConfig, image: value })}
                >
                  <SelectTrigger id="container-image">
                    <SelectValue placeholder="Select an image" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingImages ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Loading images...</span>
                      </div>
                    ) : (
                      images.map((image) => (
                        <SelectItem key={image.id} value={`${image.repository}:${image.tag}`}>
                          {image.repository}:{image.tag}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="restart-policy">Restart Policy</Label>
              <Select
                value={containerConfig.restart}
                onValueChange={(value: "no" | "always" | "on-failure" | "unless-stopped") =>
                  setContainerConfig({ ...containerConfig, restart: value })
                }
              >
                <SelectTrigger id="restart-policy">
                  <SelectValue placeholder="Select restart policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="always">Always</SelectItem>
                  <SelectItem value="on-failure">On Failure</SelectItem>
                  <SelectItem value="unless-stopped">Unless Stopped</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cpu-shares">CPU Shares (0-1024)</Label>
                <Input
                  id="cpu-shares"
                  type="number"
                  placeholder="512"
                  value={containerConfig.resources?.cpuShares || ""}
                  onChange={(e) =>
                    setContainerConfig({
                      ...containerConfig,
                      resources: {
                        ...containerConfig.resources,
                        cpuShares: Number.parseInt(e.target.value) || undefined,
                      },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="memory-limit">Memory Limit (MB)</Label>
                <Input
                  id="memory-limit"
                  type="number"
                  placeholder="1024"
                  value={containerConfig.resources?.memory ? containerConfig.resources.memory / (1024 * 1024) : ""}
                  onChange={(e) =>
                    setContainerConfig({
                      ...containerConfig,
                      resources: {
                        ...containerConfig.resources,
                        memory: (Number.parseInt(e.target.value) || 0) * 1024 * 1024,
                      },
                    })
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ports" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="container-port">Container Port</Label>
                  <Input
                    id="container-port"
                    placeholder="8080"
                    value={newPort.container}
                    onChange={(e) => setNewPort({ ...newPort, container: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="host-port">Host Port</Label>
                  <Input
                    id="host-port"
                    placeholder="8080"
                    value={newPort.host}
                    onChange={(e) => setNewPort({ ...newPort, host: e.target.value })}
                  />
                </div>
              </div>

              <Button type="button" variant="outline" onClick={addPort} disabled={!newPort.container || !newPort.host}>
                <Plus className="h-4 w-4 mr-2" />
                Add Port Mapping
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Port Mappings</Label>
              {Object.entries(containerConfig.ports).length === 0 ? (
                <p className="text-sm text-muted-foreground">No port mappings configured.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(containerConfig.ports).map(([containerPort, hostPort]) => (
                    <div key={containerPort} className="flex items-center justify-between p-2 border rounded-md">
                      <span>
                        {containerPort} → {hostPort}
                      </span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removePort(containerPort)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="volumes" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="volume-mapping">Volume Mapping</Label>
                <Input
                  id="volume-mapping"
                  placeholder="volume-name:/path/in/container"
                  value={newVolume}
                  onChange={(e) => setNewVolume(e.target.value)}
                />
              </div>

              <Button type="button" variant="outline" onClick={addVolume} disabled={!newVolume}>
                <Plus className="h-4 w-4 mr-2" />
                Add Volume
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Volumes</Label>
              {containerConfig.volumes.length === 0 ? (
                <p className="text-sm text-muted-foreground">No volumes configured.</p>
              ) : (
                <div className="space-y-2">
                  {containerConfig.volumes.map((volume) => (
                    <div key={volume} className="flex items-center justify-between p-2 border rounded-md">
                      <span>{volume}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeVolume(volume)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="env" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="env-key">Key</Label>
                  <Input
                    id="env-key"
                    placeholder="MYSQL_ROOT_PASSWORD"
                    value={newEnv.key}
                    onChange={(e) => setNewEnv({ ...newEnv, key: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="env-value">Value</Label>
                  <Input
                    id="env-value"
                    placeholder="my-secret-pw"
                    value={newEnv.value}
                    onChange={(e) => setNewEnv({ ...newEnv, value: e.target.value })}
                  />
                </div>
              </div>

              <Button type="button" variant="outline" onClick={addEnv} disabled={!newEnv.key || !newEnv.value}>
                <Plus className="h-4 w-4 mr-2" />
                Add Environment Variable
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Environment Variables</Label>
              {containerConfig.env.length === 0 ? (
                <p className="text-sm text-muted-foreground">No environment variables configured.</p>
              ) : (
                <div className="space-y-2">
                  {containerConfig.env.map((env) => (
                    <div key={env} className="flex items-center justify-between p-2 border rounded-md">
                      <span>{env}</span>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeEnv(env)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateContainer}
            disabled={isCreating || !containerConfig.name || !containerConfig.image}
          >
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Container
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
