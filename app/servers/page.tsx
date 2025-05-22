// app/servers/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ServerList } from "@/components/server-list"
import { ServerCreationWizard } from "@/components/server-creation-wizard"
import { Plus } from 'lucide-react'

export default function ServersPage() {
  const [isCreatingServer, setIsCreatingServer] = useState(false)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Game Servers</h1>
        <Button onClick={() => setIsCreatingServer(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Server
        </Button>
      </div>

      <ServerList />

      <ServerCreationWizard 
        open={isCreatingServer} 
        onOpenChange={setIsCreatingServer} 
      />
    </div>
  )
}