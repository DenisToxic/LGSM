"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Server, Loader2, RefreshCw, Terminal, Trash2, Check, Clock, X, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
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

import { useCloudDeployment } from "@/lib/hooks/use-cloud-deployments"
import { cloudProviderInfo, type DeploymentStatus } from "@/lib/cloud-providers"
import { useState } from "react"

export default function DeploymentDetailsPage({ params }: { params: { id: string } }) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false)

  const { deployment, isLoading, isError, mutate } = useCloudDeployment(params.id)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const getStatusBadge = (status: DeploymentStatus) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
            Pending
          </Badge>
        )
      case "provisioning":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Provisioning
          </Badge>
        )
      case "configuring":
        return (
          <Badge variant="outline" className="border-purple-500 text-purple-500">
            Configuring
          </Badge>
        )
      case "starting":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            Starting
          </Badge>
        )
      case "running":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Running
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">
            Failed
          </Badge>
        )
      case "stopped":
        return (
          <Badge variant="outline" className="border-orange-500 text-orange-500">
            Stopped
          </Badge>
        )
      case "terminated":
        return (
          <Badge variant="outline" className="border-gray-500 text-gray-500">
            Terminated
          </Badge>
        )
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getDeploymentProgress = (status: DeploymentStatus) => {
    switch (status) {
      case "pending":
        return 10
      case "provisioning":
        return 30
      case "configuring":
        return 60
      case "starting":
        return 80
      case "running":
        return 100
      case "failed":
        return 100
      case "stopped":
        return 100
      case "terminated":
        return 100
      default:
        return 0
    }
  }

  const getStepIcon = (status: "pending" | "in_progress" | "completed" | "failed") => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-gray-500" />
      case "in_progress":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "completed":
        return <Check className="h-4 w-4 text-green-500" />
      case "failed":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/cloud")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Deployment Details</h2>
        </div>
        {deployment && deployment.status === "running" && (
          <Button variant="destructive" onClick={() => setIsTerminateDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Terminate
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading deployment details...</span>
        </div>
      ) : isError ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <CardTitle className="text-xl mb-2">Error Loading Deployment</CardTitle>
          <CardDescription className="mb-6">
            There was a problem loading the deployment details. Please try again later.
          </CardDescription>
          <Button onClick={() => mutate()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </Card>
      ) : !deployment ? (
        <Card className="flex flex-col items-center justify-center p-10 text-center">
          <CardTitle className="text-xl mb-2">Deployment Not Found</CardTitle>
          <CardDescription className="mb-6">
            The deployment you're looking for doesn't exist or has been deleted.
          </CardDescription>
          <Button onClick={() => router.push("/cloud")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Deployments
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <img
                        src={cloudProviderInfo[deployment.provider].logo || "/placeholder.svg"}
                        alt={cloudProviderInfo[deployment.provider].name}
                        className="h-5 w-5"
                      />
                    </div>
                    <CardTitle>{deployment.serverId}</CardTitle>
                  </div>
                  {getStatusBadge(deployment.status)}
                </div>
                <CardDescription>
                  Deployed to {cloudProviderInfo[deployment.provider].name} in {deployment.region}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deployment.status !== "running" &&
                  deployment.status !== "failed" &&
                  deployment.status !== "terminated" && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Deployment Progress</span>
                        <span className="font-medium">{getDeploymentProgress(deployment.status)}%</span>
                      </div>
                      <Progress value={getDeploymentProgress(deployment.status)} className="h-2" />
                    </div>
                  )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Provider</p>
                    <p>{cloudProviderInfo[deployment.provider].name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Region</p>
                    <p>{deployment.region}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Instance Type</p>
                    <p>{deployment.instanceType}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Status</p>
                    <p>{deployment.status}</p>
                  </div>
                  {deployment.instanceId && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Instance ID</p>
                      <p>{deployment.instanceId}</p>
                    </div>
                  )}
                  {deployment.publicIp && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Public IP</p>
                      <p>{deployment.publicIp}</p>
                    </div>
                  )}
                  {deployment.privateIp && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Private IP</p>
                      <p>{deployment.privateIp}</p>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Start Time</p>
                    <p>{new Date(deployment.startTime).toLocaleString()}</p>
                  </div>
                  {deployment.endTime && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium">End Time</p>
                      <p>{new Date(deployment.endTime).toLocaleString()}</p>
                    </div>
                  )}
                </div>

                {deployment.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{deployment.error}</AlertDescription>
                  </Alert>
                )}

                {deployment.status === "running" && (
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      <Terminal className="mr-2 h-4 w-4" />
                      Console
                    </Button>
                    <Button variant="outline">
                      <Server className="mr-2 h-4 w-4" />
                      Server Details
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Deployment Steps</CardTitle>
                <CardDescription>Progress of the deployment process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deployment.steps.map((step, index) => (
                    <div key={index} className="flex items-start">
                      <div className="mt-0.5 mr-3">{getStepIcon(step.status)}</div>
                      <div className="space-y-1">
                        <p
                          className={`font-medium ${
                            step.status === "failed"
                              ? "text-red-500"
                              : step.status === "completed"
                                ? "text-green-500"
                                : step.status === "in_progress"
                                  ? "text-blue-500"
                                  : ""
                          }`}
                        >
                          {step.name}
                        </p>
                        {step.message && <p className="text-sm text-muted-foreground">{step.message}</p>}
                        {step.timestamp && (
                          <p className="text-xs text-muted-foreground">{new Date(step.timestamp).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Deployment Logs</CardTitle>
                <CardDescription>Real-time logs from the deployment process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black text-green-400 font-mono text-xs p-4 rounded-md h-[400px] overflow-y-auto">
                  {deployment.logs.map((log, index) => (
                    <div key={index} className="whitespace-pre-wrap break-all mb-1">
                      {log}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connection Information</CardTitle>
                <CardDescription>Details for connecting to your server</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deployment.status === "running" ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Game Server Address</p>
                      <p className="font-mono">{deployment.publicIp}:25565</p>
                    </div>
                    <Separator />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">SSH Access</p>
                      <p className="font-mono text-xs">ssh admin@{deployment.publicIp}</p>
                    </div>
                    <Alert>
                      <AlertDescription>
                        Remember to use the SSH key you specified during deployment to connect to your server.
                      </AlertDescription>
                    </Alert>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <p className="text-muted-foreground">
                      Connection information will be available once the server is running.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <AlertDialog open={isTerminateDialogOpen} onOpenChange={setIsTerminateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to terminate this deployment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently terminate the server and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-500 hover:bg-red-600">Terminate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
