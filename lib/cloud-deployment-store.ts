import {
  type CloudCredentials,
  type DeploymentConfig,
  type DeploymentResult,
  deployToCloud,
} from "@/lib/cloud-providers"

// In-memory store for cloud credentials
const cloudCredentials: CloudCredentials[] = []

// In-memory store for deployments
const deployments: DeploymentResult[] = []

// Get all cloud credentials
export function getCloudCredentials(): CloudCredentials[] {
  return [...cloudCredentials]
}

// Get a specific cloud credential by ID
export function getCloudCredentialById(id: string): CloudCredentials | undefined {
  return cloudCredentials.find((cred) => cred.name === id)
}

// Add a new cloud credential
export function addCloudCredential(credential: CloudCredentials): CloudCredentials {
  // Check if credential with the same name already exists
  const existingIndex = cloudCredentials.findIndex((cred) => cred.name === credential.name)

  if (existingIndex >= 0) {
    // Update existing credential
    cloudCredentials[existingIndex] = {
      ...credential,
      lastValidated: new Date().toISOString(),
    }
    return cloudCredentials[existingIndex]
  } else {
    // Add new credential
    const newCredential = {
      ...credential,
      lastValidated: new Date().toISOString(),
    }
    cloudCredentials.push(newCredential)
    return newCredential
  }
}

// Delete a cloud credential
export function deleteCloudCredential(id: string): boolean {
  const index = cloudCredentials.findIndex((cred) => cred.name === id)
  if (index >= 0) {
    cloudCredentials.splice(index, 1)
    return true
  }
  return false
}

// Get all deployments
export function getDeployments(): DeploymentResult[] {
  return [...deployments]
}

// Get a specific deployment by ID
export function getDeploymentById(id: string): DeploymentResult | undefined {
  return deployments.find((dep) => dep.id === id)
}

// Create a new deployment
export async function createDeployment(config: DeploymentConfig): Promise<DeploymentResult> {
  // Deploy to cloud provider
  const result = await deployToCloud(config)

  // Add to deployments store
  deployments.push(result)

  // Start the deployment simulation
  simulateDeployment(result.id)

  return result
}

// Simulate deployment progress
function simulateDeployment(deploymentId: string): void {
  const deployment = deployments.find((dep) => dep.id === deploymentId)
  if (!deployment) return

  // Update first step to in_progress
  deployment.steps[0].status = "in_progress"
  deployment.logs.push(`[${new Date().toISOString()}] Validating configuration...`)

  // Simulate step completion with delays
  setTimeout(() => {
    if (deployment.steps[0].status !== "failed") {
      // Complete first step
      deployment.steps[0].status = "completed"
      deployment.steps[0].timestamp = new Date().toISOString()
      deployment.logs.push(`[${new Date().toISOString()}] Configuration validated successfully`)

      // Start second step
      deployment.steps[1].status = "in_progress"
      deployment.steps[1].timestamp = new Date().toISOString()
      deployment.logs.push(`[${new Date().toISOString()}] Provisioning infrastructure...`)
      deployment.status = "provisioning"

      // Simulate second step completion
      setTimeout(() => {
        if (deployment.steps[1].status !== "failed") {
          // Complete second step
          deployment.steps[1].status = "completed"
          deployment.steps[1].timestamp = new Date().toISOString()
          deployment.logs.push(`[${new Date().toISOString()}] Infrastructure provisioned successfully`)
          deployment.instanceId = `i-${Math.random().toString(36).substring(2, 10)}`
          deployment.publicIp = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
          deployment.privateIp = `10.0.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`

          // Start third step
          deployment.steps[2].status = "in_progress"
          deployment.steps[2].timestamp = new Date().toISOString()
          deployment.logs.push(`[${new Date().toISOString()}] Configuring server...`)
          deployment.status = "configuring"

          // Simulate third step completion
          setTimeout(() => {
            if (deployment.steps[2].status !== "failed") {
              // Complete third step
              deployment.steps[2].status = "completed"
              deployment.steps[2].timestamp = new Date().toISOString()
              deployment.logs.push(`[${new Date().toISOString()}] Server configured successfully`)

              // Start fourth step
              deployment.steps[3].status = "in_progress"
              deployment.steps[3].timestamp = new Date().toISOString()
              deployment.logs.push(`[${new Date().toISOString()}] Starting game server...`)
              deployment.status = "starting"

              // Simulate fourth step completion
              setTimeout(() => {
                if (deployment.steps[3].status !== "failed") {
                  // Complete fourth step
                  deployment.steps[3].status = "completed"
                  deployment.steps[3].timestamp = new Date().toISOString()
                  deployment.logs.push(`[${new Date().toISOString()}] Game server started successfully`)
                  deployment.status = "running"
                  deployment.endTime = new Date().toISOString()
                }
              }, 5000)
            }
          }, 8000)
        }
      }, 10000)
    }
  }, 3000)
}

// Cancel a deployment
export function cancelDeployment(id: string): boolean {
  const deployment = deployments.find((dep) => dep.id === id)
  if (!deployment) return false

  // Can only cancel deployments that are not completed or failed
  if (deployment.status === "running" || deployment.status === "failed" || deployment.status === "terminated") {
    return false
  }

  // Mark current step as failed
  const currentStepIndex = deployment.steps.findIndex((step) => step.status === "in_progress")
  if (currentStepIndex >= 0) {
    deployment.steps[currentStepIndex].status = "failed"
    deployment.steps[currentStepIndex].message = "Deployment cancelled by user"
  }

  // Mark remaining steps as pending
  for (let i = currentStepIndex + 1; i < deployment.steps.length; i++) {
    deployment.steps[i].status = "pending"
  }

  // Update deployment status
  deployment.status = "failed"
  deployment.error = "Deployment cancelled by user"
  deployment.endTime = new Date().toISOString()
  deployment.logs.push(`[${new Date().toISOString()}] Deployment cancelled by user`)

  return true
}

// Terminate a deployment
export function terminateDeployment(id: string): boolean {
  const deployment = deployments.find((dep) => dep.id === id)
  if (!deployment) return false

  // Can only terminate running deployments
  if (deployment.status !== "running") {
    return false
  }

  // Update deployment status
  deployment.status = "terminated"
  deployment.endTime = new Date().toISOString()
  deployment.logs.push(`[${new Date().toISOString()}] Deployment terminated by user`)

  return true
}
