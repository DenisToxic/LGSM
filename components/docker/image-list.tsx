"use client"

import { useState } from "react"
import { useDockerImages } from "@/lib/hooks/use-docker-images"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PullImageDialog } from "@/components/docker/pull-image-dialog"
import { Loader2, Plus, RefreshCw, ImageIcon } from "lucide-react"

export function ImageList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isPullDialogOpen, setIsPullDialogOpen] = useState(false)

  const { images, isLoading, isError } = useDockerImages()

  const filteredImages = images.filter(
    (image) =>
      image.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tag.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  if (isError) {
    return (
      <Card className="flex flex-col items-center justify-center p-10 text-center">
        <CardTitle className="text-xl mb-2">Error Loading Images</CardTitle>
        <CardDescription className="mb-6">
          There was a problem loading your Docker images. Please try again later.
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
          placeholder="Search images..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={() => setIsPullDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Pull Image
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading images...</span>
        </div>
      ) : images.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <CardTitle className="text-xl mb-2">No Images Found</CardTitle>
          <CardDescription className="mb-6">
            You don't have any Docker images yet. Pull your first image to get started.
          </CardDescription>
          <Button onClick={() => setIsPullDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Pull Your First Image
          </Button>
        </Card>
      ) : filteredImages.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <CardTitle className="text-xl mb-2">No Matching Images</CardTitle>
          <CardDescription>No images match your search criteria. Try a different search term.</CardDescription>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredImages.map((image) => (
            <Card key={image.id}>
              <CardHeader>
                <CardTitle className="text-lg truncate">{image.repository}</CardTitle>
                <CardDescription>{image.tag}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">ID</p>
                      <p className="text-sm font-medium truncate">{image.id.substring(7, 19)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Size</p>
                      <p className="text-sm font-medium">{formatSize(image.size)}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm font-medium">
                      {new Date(image.created).toLocaleDateString()} {new Date(image.created).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PullImageDialog open={isPullDialogOpen} onOpenChange={setIsPullDialogOpen} />
    </div>
  )
}
