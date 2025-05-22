import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getCloudCredentialById, deleteCloudCredential } from "@/lib/cloud-deployment-store"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const credential = getCloudCredentialById(id)

  if (!credential) {
    return NextResponse.json({ error: "Cloud credential not found" }, { status: 404 })
  }

  // Mask sensitive information
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

  return NextResponse.json(maskedCredential)
}

// DELETE a cloud credential
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const id = params.id
  const success = deleteCloudCredential(id)

  if (!success) {
    return NextResponse.json({ error: "Cloud credential not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
