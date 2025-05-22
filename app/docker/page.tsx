import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContainerList } from "@/components/docker/container-list"
import { ImageList } from "@/components/docker/image-list"
import { VolumeList } from "@/components/docker/volume-list"

export default function DockerPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Docker Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage Docker containers, images, and volumes for your game servers.
        </p>
      </div>

      <Tabs defaultValue="containers">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="containers">Containers</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="volumes">Volumes</TabsTrigger>
        </TabsList>
        <TabsContent value="containers">
          <ContainerList />
        </TabsContent>
        <TabsContent value="images">
          <ImageList />
        </TabsContent>
        <TabsContent value="volumes">
          <VolumeList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
