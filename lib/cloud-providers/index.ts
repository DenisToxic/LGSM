// Cloud provider integration module
import type { ServerFormData } from "@/components/server-creation-wizard"

export type CloudProvider = "aws" | "gcp" | "azure" | "digitalocean" | "linode"

export type CloudRegion = {
  id: string
  name: string
  location: string
  available: boolean
}

export type CloudInstanceType = {
  id: string
  name: string
  cpu: number
  memory: number
  storage: number
  pricePerHour: number
  pricePerMonth: number
}

export type CloudCredentials = {
  provider: CloudProvider
  name: string
  isValid: boolean
  lastValidated?: string
  // Provider-specific credentials
  aws?: {
    accessKeyId: string
    secretAccessKey: string
    region: string
  }
  gcp?: {
    projectId: string
    keyFile: string
  }
  azure?: {
    subscriptionId: string
    tenantId: string
    clientId: string
    clientSecret: string
  }
  digitalocean?: {
    apiToken: string
  }
  linode?: {
    apiToken: string
  }
}

export type DeploymentConfig = {
  provider: CloudProvider
  region: string
  instanceType: string
  credentials: string // ID of stored credentials
  serverConfig: ServerFormData
  additionalConfig?: {
    vpcId?: string
    subnetId?: string
    securityGroupId?: string
    keyPairName?: string
    tags?: Record<string, string>
  }
}

export type DeploymentStatus =
  | "pending"
  | "provisioning"
  | "configuring"
  | "starting"
  | "running"
  | "failed"
  | "stopped"
  | "terminated"

export type DeploymentStep = {
  name: string
  status: "pending" | "in_progress" | "completed" | "failed"
  message?: string
  timestamp?: string
}

export type DeploymentResult = {
  id: string
  status: DeploymentStatus
  serverId: string
  provider: CloudProvider
  region: string
  instanceType: string
  instanceId?: string
  publicIp?: string
  privateIp?: string
  startTime: string
  endTime?: string
  steps: DeploymentStep[]
  logs: string[]
  error?: string
}

// Available cloud regions by provider
export const cloudRegions: Record<CloudProvider, CloudRegion[]> = {
  aws: [
    { id: "us-east-1", name: "US East (N. Virginia)", location: "North America", available: true },
    { id: "us-west-2", name: "US West (Oregon)", location: "North America", available: true },
    { id: "eu-west-1", name: "EU West (Ireland)", location: "Europe", available: true },
    { id: "ap-northeast-1", name: "Asia Pacific (Tokyo)", location: "Asia Pacific", available: true },
    { id: "sa-east-1", name: "South America (São Paulo)", location: "South America", available: true },
  ],
  gcp: [
    { id: "us-central1", name: "Iowa", location: "North America", available: true },
    { id: "us-east1", name: "South Carolina", location: "North America", available: true },
    { id: "europe-west1", name: "Belgium", location: "Europe", available: true },
    { id: "asia-east1", name: "Taiwan", location: "Asia Pacific", available: true },
    { id: "australia-southeast1", name: "Sydney", location: "Australia", available: true },
  ],
  azure: [
    { id: "eastus", name: "East US", location: "North America", available: true },
    { id: "westus2", name: "West US 2", location: "North America", available: true },
    { id: "northeurope", name: "North Europe", location: "Europe", available: true },
    { id: "southeastasia", name: "Southeast Asia", location: "Asia Pacific", available: true },
    { id: "brazilsouth", name: "Brazil South", location: "South America", available: true },
  ],
  digitalocean: [
    { id: "nyc1", name: "New York 1", location: "North America", available: true },
    { id: "sfo2", name: "San Francisco 2", location: "North America", available: true },
    { id: "lon1", name: "London 1", location: "Europe", available: true },
    { id: "sgp1", name: "Singapore 1", location: "Asia Pacific", available: true },
    { id: "blr1", name: "Bangalore 1", location: "Asia Pacific", available: true },
  ],
  linode: [
    { id: "us-east", name: "Newark, NJ", location: "North America", available: true },
    { id: "us-central", name: "Dallas, TX", location: "North America", available: true },
    { id: "eu-west", name: "London, UK", location: "Europe", available: true },
    { id: "ap-south", name: "Singapore", location: "Asia Pacific", available: true },
    { id: "ca-central", name: "Toronto, ON", location: "North America", available: true },
  ],
}

// Available instance types by provider
export const cloudInstanceTypes: Record<CloudProvider, CloudInstanceType[]> = {
  aws: [
    { id: "t3.small", name: "t3.small", cpu: 2, memory: 2, storage: 20, pricePerHour: 0.0208, pricePerMonth: 15.18 },
    { id: "t3.medium", name: "t3.medium", cpu: 2, memory: 4, storage: 40, pricePerHour: 0.0416, pricePerMonth: 30.37 },
    { id: "m5.large", name: "m5.large", cpu: 2, memory: 8, storage: 80, pricePerHour: 0.096, pricePerMonth: 70.08 },
    { id: "c5.large", name: "c5.large", cpu: 2, memory: 4, storage: 40, pricePerHour: 0.085, pricePerMonth: 62.05 },
    { id: "r5.large", name: "r5.large", cpu: 2, memory: 16, storage: 80, pricePerHour: 0.126, pricePerMonth: 91.98 },
  ],
  gcp: [
    {
      id: "e2-standard-2",
      name: "e2-standard-2",
      cpu: 2,
      memory: 8,
      storage: 40,
      pricePerHour: 0.0768,
      pricePerMonth: 56.06,
    },
    {
      id: "e2-standard-4",
      name: "e2-standard-4",
      cpu: 4,
      memory: 16,
      storage: 80,
      pricePerHour: 0.1535,
      pricePerMonth: 112.06,
    },
    {
      id: "n2-standard-2",
      name: "n2-standard-2",
      cpu: 2,
      memory: 8,
      storage: 40,
      pricePerHour: 0.0971,
      pricePerMonth: 70.88,
    },
    {
      id: "c2-standard-4",
      name: "c2-standard-4",
      cpu: 4,
      memory: 16,
      storage: 80,
      pricePerHour: 0.2088,
      pricePerMonth: 152.42,
    },
    {
      id: "n2-highmem-2",
      name: "n2-highmem-2",
      cpu: 2,
      memory: 16,
      storage: 80,
      pricePerHour: 0.131,
      pricePerMonth: 95.63,
    },
  ],
  azure: [
    {
      id: "Standard_B2s",
      name: "Standard_B2s",
      cpu: 2,
      memory: 4,
      storage: 40,
      pricePerHour: 0.0416,
      pricePerMonth: 30.37,
    },
    {
      id: "Standard_D2s_v3",
      name: "Standard_D2s_v3",
      cpu: 2,
      memory: 8,
      storage: 40,
      pricePerHour: 0.096,
      pricePerMonth: 70.08,
    },
    {
      id: "Standard_F2s_v2",
      name: "Standard_F2s_v2",
      cpu: 2,
      memory: 4,
      storage: 40,
      pricePerHour: 0.085,
      pricePerMonth: 62.05,
    },
    {
      id: "Standard_E2s_v3",
      name: "Standard_E2s_v3",
      cpu: 2,
      memory: 16,
      storage: 80,
      pricePerHour: 0.126,
      pricePerMonth: 91.98,
    },
    {
      id: "Standard_D4s_v3",
      name: "Standard_D4s_v3",
      cpu: 4,
      memory: 16,
      storage: 80,
      pricePerHour: 0.192,
      pricePerMonth: 140.16,
    },
  ],
  digitalocean: [
    { id: "s-2vcpu-2gb", name: "Basic 2GB", cpu: 2, memory: 2, storage: 50, pricePerHour: 0.02, pricePerMonth: 15 },
    { id: "s-2vcpu-4gb", name: "Basic 4GB", cpu: 2, memory: 4, storage: 80, pricePerHour: 0.03, pricePerMonth: 20 },
    { id: "s-4vcpu-8gb", name: "Basic 8GB", cpu: 4, memory: 8, storage: 160, pricePerHour: 0.06, pricePerMonth: 40 },
    { id: "c-2", name: "CPU-Optimized 4GB", cpu: 2, memory: 4, storage: 50, pricePerHour: 0.04, pricePerMonth: 30 },
    {
      id: "g-2vcpu-8gb",
      name: "General Purpose 8GB",
      cpu: 2,
      memory: 8,
      storage: 50,
      pricePerHour: 0.07,
      pricePerMonth: 50,
    },
  ],
  linode: [
    { id: "g6-standard-1", name: "Shared 2GB", cpu: 1, memory: 2, storage: 50, pricePerHour: 0.015, pricePerMonth: 10 },
    { id: "g6-standard-2", name: "Shared 4GB", cpu: 2, memory: 4, storage: 80, pricePerHour: 0.03, pricePerMonth: 20 },
    { id: "g6-standard-4", name: "Shared 8GB", cpu: 4, memory: 8, storage: 160, pricePerHour: 0.06, pricePerMonth: 40 },
    {
      id: "g6-standard-8",
      name: "Shared 16GB",
      cpu: 8,
      memory: 16,
      storage: 320,
      pricePerHour: 0.12,
      pricePerMonth: 80,
    },
    {
      id: "g6-standard-16",
      name: "Shared 32GB",
      cpu: 16,
      memory: 32,
      storage: 640,
      pricePerHour: 0.24,
      pricePerMonth: 160,
    },
  ],
}

// Provider display information
export const cloudProviderInfo: Record<CloudProvider, { name: string; description: string; logo: string }> = {
  aws: {
    name: "Amazon Web Services",
    description: "Deploy to Amazon EC2 instances with global availability.",
    logo: "/cloud-logos/aws.png",
  },
  gcp: {
    name: "Google Cloud Platform",
    description: "Deploy to Google Compute Engine with high performance.",
    logo: "/cloud-logos/gcp.png",
  },
  azure: {
    name: "Microsoft Azure",
    description: "Deploy to Azure Virtual Machines with enterprise support.",
    logo: "/cloud-logos/azure.png",
  },
  digitalocean: {
    name: "DigitalOcean",
    description: "Deploy to DigitalOcean Droplets with simple pricing.",
    logo: "/cloud-logos/digitalocean.png",
  },
  linode: {
    name: "Linode",
    description: "Deploy to Linode instances with high-performance SSD storage.",
    logo: "/cloud-logos/linode.png",
  },
}

// Mock function to deploy a server to a cloud provider
export async function deployToCloud(config: DeploymentConfig): Promise<DeploymentResult> {
  // In a real implementation, this would call the appropriate cloud provider's API
  // For now, we'll simulate the deployment process

  const deploymentId = `deploy-${Date.now()}`
  const startTime = new Date().toISOString()

  // Initial deployment result
  const result: DeploymentResult = {
    id: deploymentId,
    status: "pending",
    serverId: config.serverConfig.name.toLowerCase().replace(/\s+/g, "-"),
    provider: config.provider,
    region: config.region,
    instanceType: config.instanceType,
    startTime,
    steps: [
      {
        name: "Validating configuration",
        status: "pending",
        timestamp: startTime,
      },
      {
        name: "Provisioning infrastructure",
        status: "pending",
      },
      {
        name: "Configuring server",
        status: "pending",
      },
      {
        name: "Starting game server",
        status: "pending",
      },
    ],
    logs: [
      `[${new Date().toISOString()}] Starting deployment to ${cloudProviderInfo[config.provider].name}`,
      `[${new Date().toISOString()}] Region: ${config.region}`,
      `[${new Date().toISOString()}] Instance type: ${config.instanceType}`,
    ],
  }

  return result
}

// Mock function to get deployment status
export async function getDeploymentStatus(deploymentId: string): Promise<DeploymentResult | null> {
  // In a real implementation, this would query the deployment status from a database
  // For now, we'll return a mock result
  return null
}

// Mock function to validate cloud credentials
export async function validateCloudCredentials(credentials: CloudCredentials): Promise<boolean> {
  // In a real implementation, this would validate the credentials with the cloud provider
  // For now, we'll simulate validation
  return true
}
