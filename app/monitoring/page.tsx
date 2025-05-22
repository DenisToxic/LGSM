"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Plus, Loader2 } from "lucide-react"
import { ServerSelect } from "@/components/monitoring/server-select"
import { MetricsOverview } from "@/components/monitoring/metrics-overview"
import { AlertsList } from "@/components/monitoring/alerts-list"
import { ThresholdsList } from "@/components/monitoring/thresholds-list"
import { DetailedMetrics } from "@/components/monitoring/detailed-metrics"
import { CreateThresholdDialog } from "@/components/monitoring/create-threshold-dialog"
import { useServers } from "@/lib/hooks/use-servers"
import { useAlerts } from "@/lib/hooks/use-alerts"

export default function MonitoringDashboard() {
  const [selectedServerId, setSelectedServerId] = useState<string | null>(null)
  const [isCreateThresholdOpen, setIsCreateThresholdOpen] = useState(false)
  const { servers, isLoading: serversLoading } = useServers()
  const { alerts, isLoading: alertsLoading } = useAlerts({ status: "active" })

  const activeAlertsCount = alerts?.length || 0

  const handleServerChange = (serverId: string) => {
    setSelectedServerId(serverId)
  }

  if (serversLoading) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading servers...</span>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Monitoring Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateThresholdOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Alert Threshold
          </Button>
        </div>
      </div>

      {activeAlertsCount > 0 && (
        <Card className="border-orange-500 dark:border-orange-400">
          <CardContent className="p-4 flex items-center">
            <AlertCircle className="h-6 w-6 text-orange-500 mr-2" />
            <div>
              <span className="font-medium">
                {activeAlertsCount} Active Alert{activeAlertsCount > 1 ? "s" : ""}
              </span>
              <span className="ml-2 text-muted-foreground">Requiring your attention</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="md:w-64 flex-shrink-0">
          <CardHeader className="pb-3">
            <CardTitle>Server Select</CardTitle>
          </CardHeader>
          <CardContent>
            <ServerSelect servers={servers} onChange={handleServerChange} />
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle>Metrics Overview</CardTitle>
            <CardDescription>Current system health metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <MetricsOverview serverId={selectedServerId} />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="detailed" className="space-y-4">
        <TabsList>
          <TabsTrigger value="detailed">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="alerts" className="relative">
            Alerts
            {activeAlertsCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {activeAlertsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="thresholds">Alert Thresholds</TabsTrigger>
        </TabsList>

        <TabsContent value="detailed" className="space-y-4">
          <DetailedMetrics serverId={selectedServerId} />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertsList />
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <ThresholdsList />
        </TabsContent>
      </Tabs>

      <CreateThresholdDialog open={isCreateThresholdOpen} onOpenChange={setIsCreateThresholdOpen} servers={servers} />
    </div>
  )
}
