"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  Cloud,
  Plus,
  Loader2,
  RefreshCw,
  MoreHorizontal,
  ExternalLink,
  Terminal,
  Trash2,
  AlertTriangle,
  Check,
  Clock,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth-provider"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

import { useCloudDeployments, useCloudCredentials } from "@/lib/hooks/use-cloud-deployments"
import { cloudProviderInfo, type DeploymentStatus } from "@/lib/cloud-providers"
import { NewDeploymentDialog } from "@/components/cloud/new-deployment-dialog"
import { NewCredentialDialog } from "@/components/cloud/new-credential-dialog"

export default function CloudPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isNewDeploymentOpen, setIsNewDeploymentOpen] = useState(false)
  const [isNewCredentialOpen, setIsNewCredentialOpen] = useState(false)
  const [deploymentToTerminate, setDeploymentToTerminate] = useState<string | null>(null)

  const {
    deployments,
    isLoading: deploymentsLoading,
    isError: deploymentsError,
    terminateDeployment,
    mutate: mutateDeployments,
  } = useCloudDeployments()

  const {
    credentials,
    isLoading: credentialsLoading,
    isError: credentialsError,
    deleteCredential,
    mutate: mutateCredentials,
  } = useCloudCredentials()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  const confirmTerminate = (deploymentId: string) => {
    setDeploymentToTerminate(deploymentId)
  }

  const handleTerminate = () => {
    if (deploymentToTerminate) {
      terminateDeployment(deploymentToTerminate)
      setDeploymentToTerminate(null)
    }
  }

  const cancelTerminate = () => {
    setDeploymentToTerminate(null)
  }

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
        <h2 className="text-3xl font-bold tracking-tight">Cloud Deployments</h2>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setIsNewCredentialOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Credentials
          </Button>
          <Button onClick={() => setIsNewDeploymentOpen(true)}>
            <Cloud className="mr-2 h-4 w-4" />
            New Deployment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="deployments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments" className="space-y-4">
          {deploymentsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading deployments...</span>
            </div>
          ) : deploymentsError ? (
            <Card className="flex flex-col items-center justify-center p-10 text-center">
              <CardTitle className="text-xl mb-2">Error Loading Deployments</CardTitle>
              <CardDescription className="mb-6">
                There was a problem loading your cloud deployments. Please try again later.
              </CardDescription>
              <Button onClick={() => mutateDeployments()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </Card>
          ) : deployments.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-10 text-center">
              <Cloud className="h-16 w-16 text-muted-foreground mb-4" />
              <CardTitle className="text-xl mb-2">No Cloud Deployments</CardTitle>
              <CardDescription className="mb-6">
                You haven't deployed any servers to the cloud yet. Create your first deployment to get started.
              </CardDescription>
              <Button onClick={() => setIsNewDeploymentOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Deployment
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deployments.map((deployment) => (
                <Card key={deployment.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <img
                            src={cloudProviderInfo[deployment.provider].logo || "/placeholder.svg"}
                            alt={cloudProviderInfo[deployment.provider].name}
                            className="h-5 w-5"
                          />
                        </div>
                        <CardTitle className="text-lg">{deployment.serverId}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Deployment Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/cloud/deployments/${deployment.id}`)}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          {deployment.status === "running" && (
                            <>
                              <DropdownMenuItem>
                                <Terminal className="mr-2 h-4 w-4" />
                                <span>Console</span>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-500"
                                onClick={() => confirmTerminate(deployment.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Terminate</span>
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="flex items-center justify-between pt-1">
                      <span>{cloudProviderInfo[deployment.provider].name}</span>
                      {getStatusBadge(deployment.status)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Region</p>
                          <p className="text-sm font-medium">{deployment.region}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Instance Type</p>
                          <p className="text-sm font-medium">{deployment.instanceType}</p>
                        </div>
                      </div>

                      {deployment.status !== "running" &&
                        deployment.status !== "failed" &&
                        deployment.status !== "terminated" && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">Deployment Progress</span>
                              <span className="font-medium">{getDeploymentProgress(deployment.status)}%</span>
                            </div>
                            <Progress value={getDeploymentProgress(deployment.status)} className="h-1" />
                          </div>
                        )}

                      {deployment.publicIp && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Public IP</p>
                          <p className="text-sm font-medium">{deployment.publicIp}</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Deployment Steps</p>
                        <div className="space-y-1">
                          {deployment.steps.map((step, index) => (
                            <div key={index} className="flex items-center text-sm">
                              {getStepIcon(step.status)}
                              <span
                                className={`ml-2 ${
                                  step.status === "failed"
                                    ? "text-red-500"
                                    : step.status === "completed"
                                      ? "text-green-500"
                                      : step.status === "in_progress"
                                        ? "text-blue-500"
                                        : "text-muted-foreground"
                                }`}
                              >
                                {step.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          {credentialsLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading credentials...</span>
            </div>
          ) : credentialsError ? (
            <Card className="flex flex-col items-center justify-center p-10 text-center">
              <CardTitle className="text-xl mb-2">Error Loading Credentials</CardTitle>
              <CardDescription className="mb-6">
                There was a problem loading your cloud credentials. Please try again later.
              </CardDescription>
              <Button onClick={() => mutateCredentials()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </Card>
          ) : credentials.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-10 text-center">
              <AlertTriangle className="h-16 w-16 text-muted-foreground mb-4" />
              <CardTitle className="text-xl mb-2">No Cloud Credentials</CardTitle>
              <CardDescription className="mb-6">
                You haven't added any cloud provider credentials yet. Add credentials to deploy servers to the cloud.
              </CardDescription>
              <Button onClick={() => setIsNewCredentialOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Credential
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {credentials.map((credential) => (
                <Card key={credential.name}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          <img
                            src={cloudProviderInfo[credential.provider].logo || "/placeholder.svg"}
                            alt={cloudProviderInfo[credential.provider].name}
                            className="h-5 w-5"
                          />
                        </div>
                        <CardTitle className="text-lg">{credential.name}</CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Credential Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-500" onClick={() => deleteCredential(credential.name)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription className="flex items-center justify-between pt-1">
                      <span>{cloudProviderInfo[credential.provider].name}</span>
                      {credential.isValid ? (
                        <Badge variant="outline" className="border-green-500 text-green-500">
                          Valid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-red-500 text-red-500">
                          Invalid
                        </Badge>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Provider</p>
                        <p className="text-sm font-medium">{cloudProviderInfo[credential.provider].name}</p>
                      </div>
                      {credential.lastValidated && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground">Last Validated</p>
                          <p className="text-sm font-medium">{new Date(credential.lastValidated).toLocaleString()}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <NewDeploymentDialog open={isNewDeploymentOpen} onOpenChange={setIsNewDeploymentOpen} />

      <NewCredentialDialog open={isNewCredentialOpen} onOpenChange={setIsNewCredentialOpen} />

      <AlertDialog open={!!deploymentToTerminate} onOpenChange={cancelTerminate}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to terminate this deployment?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently terminate the server and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleTerminate} className="bg-red-500 hover:bg-red-600">
              Terminate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
