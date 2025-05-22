"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { ServerList } from "@/components/server-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServerCreationWizard } from "@/components/server-creation-wizard"

export default function ServersPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Servers</h2>
        <Button onClick={() => setIsWizardOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Server
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Servers</TabsTrigger>
          <TabsTrigger value="online">Online</TabsTrigger>
          <TabsTrigger value="offline">Offline</TabsTrigger>
          <TabsTrigger value="minecraft">Minecraft</TabsTrigger>
          <TabsTrigger value="csgo">CS:GO</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ServerList />
        </TabsContent>

        <TabsContent value="online" className="space-y-4">
          <ServerList />
        </TabsContent>

        <TabsContent value="offline" className="space-y-4">
          <ServerList />
        </TabsContent>

        <TabsContent value="minecraft" className="space-y-4">
          <ServerList />
        </TabsContent>

        <TabsContent value="csgo" className="space-y-4">
          <ServerList />
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <ServerList />
        </TabsContent>
      </Tabs>

      <ServerCreationWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />
    </div>
  )
}
