"use client"

import { useState, useEffect } from "react"
import { Cloud, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

import { useCloudCredentials } from "@/lib/hooks/use-cloud-deployments"
import { cloudProviderInfo, type CloudProvider, type CloudCredentials } from "@/lib/cloud-providers"

interface NewCredentialDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewCredentialDialog({ open, onOpenChange }: NewCredentialDialogProps) {
  const [selectedProvider, setSelectedProvider] = useState<CloudProvider | null>(null)
  const [credentialName, setCredentialName] = useState("")

  // AWS credentials
  const [awsAccessKeyId, setAwsAccessKeyId] = useState("")
  const [awsSecretAccessKey, setAwsSecretAccessKey] = useState("")
  const [awsRegion, setAwsRegion] = useState("")

  // GCP credentials
  const [gcpProjectId, setGcpProjectId] = useState("")
  const [gcpKeyFile, setGcpKeyFile] = useState("")

  // Azure credentials
  const [azureSubscriptionId, setAzureSubscriptionId] = useState("")
  const [azureTenantId, setAzureTenantId] = useState("")
  const [azureClientId, setAzureClientId] = useState("")
  const [azureClientSecret, setAzureClientSecret] = useState("")

  // DigitalOcean credentials
  const [digitaloceanApiToken, setDigitaloceanApiToken] = useState("")

  // Linode credentials
  const [linodeApiToken, setLinodeApiToken] = useState("")

  const { addCredential, isAdding } = useCloudCredentials()

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedProvider(null)
      setCredentialName("")
      setAwsAccessKeyId("")
      setAwsSecretAccessKey("")
      setAwsRegion("")
      setGcpProjectId("")
      setGcpKeyFile("")
      setAzureSubscriptionId("")
      setAzureTenantId("")
      setAzureClientId("")
      setAzureClientSecret("")
      setDigitaloceanApiToken("")
      setLinodeApiToken("")
    }
  }, [open])

  const handleProviderSelect = (provider: CloudProvider) => {
    setSelectedProvider(provider)
  }

  const isFormValid = () => {
    if (!selectedProvider || !credentialName) return false

    switch (selectedProvider) {
      case "aws":
        return !!awsAccessKeyId && !!awsSecretAccessKey && !!awsRegion
      case "gcp":
        return !!gcpProjectId && !!gcpKeyFile
      case "azure":
        return !!azureSubscriptionId && !!azureTenantId && !!azureClientId && !!azureClientSecret
      case "digitalocean":
        return !!digitaloceanApiToken
      case "linode":
        return !!linodeApiToken
      default:
        return false
    }
  }

  const handleAddCredential = async () => {
    if (!selectedProvider || !credentialName || !isFormValid()) return

    const credential: CloudCredentials = {
      provider: selectedProvider,
      name: credentialName,
      isValid: true,
    }

    switch (selectedProvider) {
      case "aws":
        credential.aws = {
          accessKeyId: awsAccessKeyId,
          secretAccessKey: awsSecretAccessKey,
          region: awsRegion,
        }
        break
      case "gcp":
        credential.gcp = {
          projectId: gcpProjectId,
          keyFile: gcpKeyFile,
        }
        break
      case "azure":
        credential.azure = {
          subscriptionId: azureSubscriptionId,
          tenantId: azureTenantId,
          clientId: azureClientId,
          clientSecret: azureClientSecret,
        }
        break
      case "digitalocean":
        credential.digitalocean = {
          apiToken: digitaloceanApiToken,
        }
        break
      case "linode":
        credential.linode = {
          apiToken: linodeApiToken,
        }
        break
    }

    try {
      await addCredential(credential)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to add credential:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Cloud className="h-5 w-5" />
            Add Cloud Credentials
          </DialogTitle>
          <DialogDescription>Add credentials for your cloud provider to deploy servers.</DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="credential-name">Credential Name</Label>
            <Input
              id="credential-name"
              placeholder="e.g., My AWS Account"
              value={credentialName}
              onChange={(e) => setCredentialName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Cloud Provider</Label>
            <RadioGroup
              value={selectedProvider || ""}
              onValueChange={(value) => handleProviderSelect(value as CloudProvider)}
            >
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(cloudProviderInfo).map(([provider, info]) => (
                  <div key={provider}>
                    <RadioGroupItem value={provider} id={`provider-${provider}`} className="peer sr-only" />
                    <Label
                      htmlFor={`provider-${provider}`}
                      className="flex items-center space-x-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                    >
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <img src={info.logo || "/placeholder.svg"} alt={info.name} className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{info.name}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          {selectedProvider && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{cloudProviderInfo[selectedProvider].name} Credentials</h3>

              {selectedProvider === "aws" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aws-access-key">Access Key ID</Label>
                    <Input
                      id="aws-access-key"
                      placeholder="AKIAIOSFODNN7EXAMPLE"
                      value={awsAccessKeyId}
                      onChange={(e) => setAwsAccessKeyId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aws-secret-key">Secret Access Key</Label>
                    <Input
                      id="aws-secret-key"
                      type="password"
                      placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                      value={awsSecretAccessKey}
                      onChange={(e) => setAwsSecretAccessKey(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aws-region">Default Region</Label>
                    <Input
                      id="aws-region"
                      placeholder="us-east-1"
                      value={awsRegion}
                      onChange={(e) => setAwsRegion(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {selectedProvider === "gcp" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gcp-project-id">Project ID</Label>
                    <Input
                      id="gcp-project-id"
                      placeholder="my-project-123456"
                      value={gcpProjectId}
                      onChange={(e) => setGcpProjectId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gcp-key-file">Service Account Key (JSON)</Label>
                    <Textarea
                      id="gcp-key-file"
                      placeholder='{"type": "service_account", ...}'
                      value={gcpKeyFile}
                      onChange={(e) => setGcpKeyFile(e.target.value)}
                      rows={8}
                    />
                  </div>
                </div>
              )}

              {selectedProvider === "azure" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="azure-subscription-id">Subscription ID</Label>
                    <Input
                      id="azure-subscription-id"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={azureSubscriptionId}
                      onChange={(e) => setAzureSubscriptionId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="azure-tenant-id">Tenant ID</Label>
                    <Input
                      id="azure-tenant-id"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={azureTenantId}
                      onChange={(e) => setAzureTenantId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="azure-client-id">Client ID</Label>
                    <Input
                      id="azure-client-id"
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      value={azureClientId}
                      onChange={(e) => setAzureClientId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="azure-client-secret">Client Secret</Label>
                    <Input
                      id="azure-client-secret"
                      type="password"
                      placeholder="Your client secret"
                      value={azureClientSecret}
                      onChange={(e) => setAzureClientSecret(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {selectedProvider === "digitalocean" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="do-api-token">API Token</Label>
                    <Input
                      id="do-api-token"
                      type="password"
                      placeholder="dop_v1_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={digitaloceanApiToken}
                      onChange={(e) => setDigitaloceanApiToken(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {selectedProvider === "linode" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="linode-api-token">API Token</Label>
                    <Input
                      id="linode-api-token"
                      type="password"
                      placeholder="Your Linode API token"
                      value={linodeApiToken}
                      onChange={(e) => setLinodeApiToken(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isAdding}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleAddCredential} disabled={!isFormValid() || isAdding}>
            {isAdding ? "Adding..." : "Add Credentials"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
