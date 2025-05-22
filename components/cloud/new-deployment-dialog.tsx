"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Cloud, Server, ChevronRight, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useCloudCredentials, useCloudDeployments } from "@/lib/hooks/use-cloud-deployments"
import { useServers } from "@/lib/hooks/use-servers"
import {
  cloudProviderInfo,
  cloudRegions,
  cloudInstanceTypes,
  type CloudProvider,
  type DeploymentConfig,
} from "@/lib/cloud-providers"

interface NewDeploymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewDeploymentDialog({ open, onOpenChange }: NewDeploymentDialogProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null)
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedInstanceType, setSelectedInstanceType] = useState("")
  const [selectedCredential, setSelectedCredential] = useState("")
  const [selectedServer, setSelectedServer] = useState("")

  const { credentials, isLoading: credentialsLoading } = useCloudCredentials()
  const { servers, isLoading: serversLoading } = useServers()
  const { createDeployment, isDeploying } = useCloudDeployments()

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentStep(0)
      setSelectedProvider(null)
      setSelectedRegion("")
      setSelectedInstanceType("")
      setSelectedCredential("")
      setSelectedServer("")
    }
  }, [open])

  // Filter credentials by selected provider
  const filteredCredentials = credentials.filter(
    (credential) => !selectedProvider || credential.provider === selectedProvider,
  )

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleProviderSelect = (provider: CloudProvider) => {
    setSelectedProvider(provider)

    // Reset other selections when provider changes
    setSelectedRegion("")
    setSelectedInstanceType("")
    setSelectedCredential("")

    // Auto-select credential if there's only one for this provider
    const providerCredentials = credentials.filter((cred) => cred.provider === provider)
    if (providerCredentials.length === 1) {
      setSelectedCredential(providerCredentials[0].name)
    }
  }

  const handleDeploy = async () => {
    if (!selectedProvider || !selectedRegion || !selectedInstanceType || !selectedCredential || !selectedServer) {
      return
    }

    const server = servers.find((s) => s.id === selectedServer)
    if (!server) return

    const deploymentConfig: DeploymentConfig = {
      provider: selectedProvider,
      region: selectedRegion,
      instanceType: selectedInstanceType,
      credentials: selectedCredential,
      serverConfig: {
        name: server.name,
        gameType: server.gameType,
        description: server.description,
        version: server.version,
        port: server.port,
        maxPlayers: server.maxPlayers,
        serverProperties: server.serverProperties,
        cpu: server.cpu,
        memory: server.memory,
        storage: server.storage,
        enableMods: server.enableMods,
        mods: server.mods,
        startupCommands: server.startupCommands,
        backupEnabled: server.backupEnabled,
        backupSchedule: server.backupSchedule,
        autoRestart: server.autoRestart,
        restartSchedule: server.restartSchedule,
      },
    }

    try {
      const deployment = await createDeployment(deploymentConfig)
      onOpenChange(false)
      router.push(`/cloud/deployments/${deployment.id}`)
    } catch (error) {
      console.error("Failed to create deployment:", error)
    }
  }

  const isNextDisabled = () => {
    switch (currentStep) {
      case 0:
        return !selectedProvider
      case 1:
        return !selectedRegion || !selectedInstanceType
      case 2:
        return !selectedCredential
      case 3:
        return !selectedServer
      default:
        return false
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Cloud className="h-5 w-5" />
            Deploy to Cloud
          </DialogTitle>
          <DialogDescription>Deploy your game server to a cloud provider in a few simple steps.</DialogDescription>
        </DialogHeader>

        <div className="mt-4 mb-4">
          <div className="flex items-center justify-between">
            {["Provider", "Resources", "Credentials", "Server"].map((step, index) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium ${
                    index <= currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted bg-background text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                {index < 3 && (
                  <ChevronRight
                    className={`mx-1 h-4 w-4 ${index < currentStep ? "text-primary" : "text-muted-foreground"}`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between px-2">
            {["Provider", "Resources", "Credentials", "Server"].map((step, index) => (
              <div
                key={`title-${step}`}
                className={`text-center text-xs ${
                  index === currentStep ? "font-medium text-foreground" : "text-muted-foreground"
                }`}
                style={{ width: `${100 / 4}%` }}
              >
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="py-4">
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Cloud Provider</h3>
              <RadioGroup
                value={selectedProvider || ""}
                onValueChange={(value) => handleProviderSelect(value as CloudProvider)}
              >
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(cloudProviderInfo).map(([provider, info]) => (
                    <div key={provider}>
                      <RadioGroupItem value={provider} id={provider} className="peer sr-only" />
                      <Label
                        htmlFor={provider}
                        className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <img src={info.logo || "/placeholder.svg"} alt={info.name} className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-base font-medium">{info.name}</p>
                            <p className="text-sm text-muted-foreground">{info.description}</p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {currentStep === 1 && selectedProvider && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Region and Instance Type</h3>

              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {cloudRegions[selectedProvider].map((region) => (
                      <SelectItem key={region.id} value={region.id}>
                        {region.name} ({region.location})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Instance Type</Label>
                <div className="grid grid-cols-1 gap-4">
                  {cloudInstanceTypes[selectedProvider].map((instance) => (
                    <div key={instance.id}>
                      <RadioGroupItem
                        value={instance.id}
                        id={instance.id}
                        className="peer sr-only"
                        name="instance-type"
                        checked={selectedInstanceType === instance.id}
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedInstanceType(instance.id)
                        }}
                      />
                      <Label
                        htmlFor={instance.id}
                        className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <div>
                          <p className="text-base font-medium">{instance.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {instance.cpu} CPU, {instance.memory} GB RAM, {instance.storage} GB Storage
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-medium">${instance.pricePerHour.toFixed(4)}/hr</p>
                          <p className="text-sm text-muted-foreground">${instance.pricePerMonth.toFixed(2)}/mo</p>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Credentials</h3>

              {credentialsLoading ? (
                <div className="flex justify-center items-center py-8">
                  <p>Loading credentials...</p>
                </div>
              ) : filteredCredentials.length === 0 ? (
                <div className="text-center py-8">
                  <p className="mb-4">
                    No credentials found for {selectedProvider && cloudProviderInfo[selectedProvider].name}.
                  </p>
                  <Button onClick={() => router.push("/cloud?tab=credentials")}>Add Credentials</Button>
                </div>
              ) : (
                <RadioGroup value={selectedCredential} onValueChange={setSelectedCredential}>
                  <div className="grid grid-cols-1 gap-4">
                    {filteredCredentials.map((credential) => (
                      <div key={credential.name}>
                        <RadioGroupItem value={credential.name} id={credential.name} className="peer sr-only" />
                        <Label
                          htmlFor={credential.name}
                          className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <img
                                src={cloudProviderInfo[credential.provider].logo || "/placeholder.svg"}
                                alt={cloudProviderInfo[credential.provider].name}
                                className="h-5 w-5"
                              />
                            </div>
                            <div>
                              <p className="text-base font-medium">{credential.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {cloudProviderInfo[credential.provider].name}
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select Server</h3>

              {serversLoading ? (
                <div className="flex justify-center items-center py-8">
                  <p>Loading servers...</p>
                </div>
              ) : servers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="mb-4">No servers found. Create a server first.</p>
                  <Button onClick={() => router.push("/servers")}>Create Server</Button>
                </div>
              ) : (
                <RadioGroup value={selectedServer} onValueChange={setSelectedServer}>
                  <div className="grid grid-cols-1 gap-4">
                    {servers.map((server) => (
                      <div key={server.id}>
                        <RadioGroupItem value={server.id} id={server.id} className="peer sr-only" />
                        <Label
                          htmlFor={server.id}
                          className="flex items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                              <Server className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-base font-medium">{server.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {server.gameType} • {server.version}
                              </p>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div>
            {currentStep > 0 && (
              <Button variant="outline" onClick={handleBack} disabled={isDeploying}>
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeploying}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={isNextDisabled()}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleDeploy} disabled={isNextDisabled() || isDeploying}>
                {isDeploying ? "Deploying..." : "Deploy Server"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
