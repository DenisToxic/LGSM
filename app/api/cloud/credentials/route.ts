import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { z } from "zod"
import { getCloudCredentials, addCloudCredential } from "@/lib/cloud-deployment-store"
import { validateCloudCredentials } from "@/lib/cloud-providers"

// Cloud credential validation schema
const cloudCredentialSchema = z.object({
  provider: z.enum(["aws", "gcp", "azure", "digitalocean", "linode"]),
  name: z.string().min(3).max(50),
  isValid: z.boolean().optional(),
  lastValidated: z.string().optional(),
  aws: z
    .object({
      accessKeyId: z.string(),
      secretAccessKey: z.string(),
      region: z.string(),
    })
    .optional(),
  gcp: z
    .object({
      projectId: z.string(),
      keyFile: z.string(),
    })
    .optional(),
  azure: z
    .object({
      subscriptionId: z.string(),
      tenantId: z.string(),
      clientId: z.string(),
      clientSecret: z.string(),
    })
    .optional(),
  digitalocean: z
    .object({
      apiToken: z.string(),
    })
    .optional(),
  linode: z
    .object({
      apiToken: z.string(),
    })
    .optional(),
})

// GET all cloud credentials
export async function GET() {
  const credentials = getCloudCredentials()

  // Mask sensitive information
  const maskedCredentials = credentials.map((cred) => {
    const masked = { ...cred }

    if (masked.aws) {
      masked.aws = {
        ...masked.aws,
        secretAccessKey: "********",
      }
    }

    if (masked.gcp) {
      masked.gcp = {
        ...masked.gcp,
        keyFile: "********",
      }
    }

    if (masked.azure) {
      masked.azure = {
        ...masked.azure,
        clientSecret: "********",
      }
    }

    if (masked.digitalocean) {
      masked.digitalocean = {
        ...masked.digitalocean,
        apiToken: "********",
      }
    }

    if (masked.linode) {
      masked.linode = {
        ...masked.linode,
        apiToken: "********",
      }
    }

    return masked
  })

  return NextResponse.json(maskedCredentials)
}

// POST a new cloud credential
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate the request body
    const validatedData = cloudCredentialSchema.parse(body)

    // Validate the credentials with the cloud provider
    const isValid = await validateCloudCredentials(validatedData)

    // Add the credential to the store
    const credential = addCloudCredential({
      ...validatedData,
      isValid,
    })

    // Mask sensitive information in the response
    const maskedCredential = { ...credential }

    if (maskedCredential.aws) {
      maskedCredential.aws = {
        ...maskedCredential.aws,
        secretAccessKey: "********",
      }
    }

    if (maskedCredential.gcp) {
      maskedCredential.gcp = {
        ...maskedCredential.gcp,
        keyFile: "********",
      }
    }

    if (maskedCredential.azure) {
      maskedCredential.azure = {
        ...maskedCredential.azure,
        clientSecret: "********",
      }
    }

    if (maskedCredential.digitalocean) {
      maskedCredential.digitalocean = {
        ...maskedCredential.digitalocean,
        apiToken: "********",
      }
    }

    if (maskedCredential.linode) {
      maskedCredential.linode = {
        ...maskedCredential.linode,
        apiToken: "********",
      }
    }

    return NextResponse.json(maskedCredential, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to add cloud credential" }, { status: 500 })
  }
}
