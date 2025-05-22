"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Server, Users, Cpu, HardDrive, Plus, Loader2, RefreshCw } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ServerStatusChart } from "@/components/server-status-chart"
import { RecentActivityList } from "@/components/recent-activity-list"
import { ServerList } from "@/components/server-list"
import { ServerCreationWizard } from "@/components/server-creation-wizard"
import { useMetrics } from "@/lib/hooks/use-metrics"
import { useServers } from "@/lib/hooks/use-servers"

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  const { metrics, isLoading: metricsLoading, isError: metricsError } = useMetrics()
  const { servers, isLoading: serversLoading } = useServers()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsWizardOpen(true)}>
            <Server className="mr-2 h-4 w-4" />
            Add Server
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="servers">Servers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {metricsLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading metrics...</span>
            </div>
          ) : metricsError ? (
            <Card className="p-6">
              <div className="flex flex-col items-center justify-center text-center">
                <CardTitle className="text-xl mb-2">Error Loading Metrics</CardTitle>
                <CardDescription className="mb-4">
                  There was a problem loading system metrics. Please try again later.
                </CardDescription>
                <Button onClick={() => window.location.reload()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Servers</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalServers}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics.onlineServers} online, {metrics.offlineServers} offline
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Players</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Across all servers</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.cpuUsage}%</div>
                  <Progress value={metrics.cpuUsage} className="h-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Memory</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.memoryUsage}%</div>
                  <Progress value={metrics.memoryUsage} className="h-2" />
                </CardContent>
              </Card>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Server Status</CardTitle>
                <CardDescription>Real-time server performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ServerStatusChart />
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest server events and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentActivityList />
              </CardContent>
            </Card>
          </div>

          {!serversLoading && servers.length === 0 && (
            <Card className="flex flex-col items-center justify-center p-10 text-center">
              <CardTitle className="text-xl mb-2">Welcome to Game Server Management</CardTitle>
              <CardDescription className="mb-6">Get started by creating your first game server.</CardDescription>
              <Button onClick={() => setIsWizardOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Server
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="servers" className="space-y-4">
          <ServerList />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Detailed server performance and player statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {serversLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading analytics data...</span>
                </div>
              ) : servers.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                  <p className="text-muted-foreground mb-4">
                    No analytics data available. Create a server to start collecting data.
                  </p>
                  <Button onClick={() => setIsWizardOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Server
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Analytics content will be displayed here. This would include detailed graphs, player retention data,
                  and server performance metrics over time.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ServerCreationWizard open={isWizardOpen} onOpenChange={setIsWizardOpen} />
    </div>
  )
}
