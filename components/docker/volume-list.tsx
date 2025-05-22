"use client"

import { useState } from "react"
import { useDockerVolumes } from "@/lib/hooks/use-docker-volumes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CreateVolumeDialog } from "@/components/docker/create-volume-dialog"
import { Loader2, Plus, RefreshCw, Database } from "lucide-react"

export function VolumeList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { volumes, isLoading, isError } = useDockerVolumes()

  const filteredVolumes = volumes.filter((volume) => volume.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (isError) {
    return (
      <Card className="flex flex-col items-center justify-center p-10 text-center">
        <CardTitle className="text-xl mb-2">Error Loading Volumes</CardTitle>
        <CardDescription className="mb-6">
          There was a problem loading your Docker volumes. Please try again later.
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
          placeholder="Search volumes..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Volume
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading volumes...</span>
        </div>
      ) : volumes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <Database className="h-16 w-16 text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No Volumes Found</CardTitle>
          <CardDescription className="mb-6">
            You don't have any Docker volumes yet. Create your first volume to get started.
          </CardDescription>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Volume
          </Button>
        </Card>
      ) : filteredVolumes.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <CardTitle className="text-xl mb-2">No Matching Volumes</CardTitle>
          <CardDescription>No volumes match your search criteria. Try a different search term.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVolumes.map((volume) => (
            <Card key={volume.name}>
              <CardHeader>
                <CardTitle className="text-lg">{volume.name}</CardTitle>
                <CardDescription>{volume.driver}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Mountpoint</p>
                    <p className="text-sm font-medium truncate">{volume.mountpoint}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">{new Date(volume.created).toLocaleDateString()}</p>
                  </div>
                  {volume.size && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="text-sm font-medium">{(volume.size / (1024 * 1024 * 1024)).toFixed(2)} GB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateVolumeDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}
