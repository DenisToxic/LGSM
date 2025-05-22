import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { getDeployments, createDeployment } from "@/lib/cloud-deployment-store"

// Deployment configuration validation schema
const deploymentConfigSchema = z.object({
  provider: z.enum(["aws", "gcp", "azure", "digitalocean", "linode"]),
  region: z.string(),
  instanceType: z.string(),
  credentials: z.string(),
  serverConfig: z.object({
    name: z.string().min(3).max(50),
    gameType: z.enum(["minecraft", "csgo", "valheim", "terraria", "rust", "custom"]),
    description: z.string().optional(),
    version: z.string(),
    port: z.number().int().min(1024).max(65535),
    maxPlayers: z.number().int().min(1),
    serverProperties: z.record(z.string()),
    cpu: z.number().int().min(1),
    memory: z.number().int().min(1),
    storage: z.number().int().min(1),
    enableMods: z.boolean(),
    mods: z.array(z.string()),
    startupCommands: z.string().optional(),
    backupEnabled: z.boolean(),
    backupSchedule: z.string(),
    autoRestart: z.boolean(),
    restartSchedule: z.string(),
  }),
  additionalConfig: z
    .object({
      vpcId: z.string().optional(),
      subnetId: z.string().optional(),
      securityGroupId: z.string().optional(),
      keyPairName: z.string().optional(),
      tags: z.record(z.string()).optional(),
    })
    .optional(),
})

// GET all deployments
export async function GET() {
  return NextResponse.json(getDeployments())
}

// POST a new deployment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = deploymentConfigSchema.parse(body)

    // Create the deployment
    const deployment = await createDeployment(validatedData)

    return NextResponse.json(deployment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create deployment" }, { status: 500 })
  }
}
