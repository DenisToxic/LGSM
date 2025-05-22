"use client"

import { useState } from "react"
import { useBackups } from "@/lib/hooks/use-backups"
import { useServers } from "@/lib/hooks/use-servers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { BackupList } from "@/components/backup/backup-list"
import { BackupScheduleList } from "@/components/backup/backup-schedule-list"
import { CreateBackupDialog } from "@/components/backup/create-backup-dialog"
import { CreateBackupScheduleDialog } from "@/components/backup/create-backup-schedule-dialog"
import { Loader2, Plus, Search } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function BackupsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedServerId, setSelectedServerId] = useState<string | undefined>("all") // Updated default value
  const [isCreateBackupOpen, setIsCreateBackupOpen] = useState(false)
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false)

  const { backups, isLoading: isLoadingBackups } = useBackups(selectedServerId)
  const { servers, isLoading: isLoadingServers } = useServers()

  const filteredBackups = backups.filter(
    (backup) =>
      backup.serverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      backup.fileName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Backups</h1>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateBackupOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Backup
          </Button>
          <Button variant="outline" onClick={() => setIsCreateScheduleOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Backup Management</CardTitle>
          <CardDescription>Manage your server backups and backup schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="backups" className="space-y-4">
            <TabsList>
              <TabsTrigger value="backups">Backups</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search backups..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={selectedServerId} onValueChange={(value) => setSelectedServerId(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All servers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All servers</SelectItem>
                  {servers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      {server.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <TabsContent value="backups" className="space-y-4">
              {isLoadingBackups || isLoadingServers ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-lg">Loading backups...</span>
                </div>
              ) : (
                <BackupList backups={filteredBackups} />
              )}
            </TabsContent>

            <TabsContent value="schedules" className="space-y-4">
              {isLoadingServers ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2 text-lg">Loading schedules...</span>
                </div>
              ) : (
                <BackupScheduleList serverId={selectedServerId} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <CreateBackupDialog open={isCreateBackupOpen} onOpenChange={setIsCreateBackupOpen} servers={servers} />

      <CreateBackupScheduleDialog
        open={isCreateScheduleOpen}
        onOpenChange={setIsCreateScheduleOpen}
        servers={servers}
      />
    </div>
  )
}
