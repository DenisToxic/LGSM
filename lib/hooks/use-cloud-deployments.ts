"use client"

import useSWR from "swr"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { CloudCredentials, DeploymentConfig } from "@/lib/cloud-providers"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.message = await res.text()
    throw error
  }
  return res.json()
}

export function useCloudCredentials() {
  const { toast } = useToast()
  const [isAdding, setIsAdding] = useState(false)

  const { data, error, isLoading, mutate } = useSWR("/api/cloud/credentials", fetcher, {
    refreshInterval: 0,
    revalidateOnFocus: true,
  })

  const addCredential = async (credential: CloudCredentials) => {
    try {
      setIsAdding(true)
      const response = await fetch("/api/cloud/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credential),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add cloud credential")
      }

      const newCredential = await response.json()

      // Update the local cache
      mutate()

      toast({
        title: "Credential added",
        description: `${newCredential.name} has been added successfully.`,
      })

      return newCredential
    } catch (error: any) {
      toast({
        title: "Failed to add credential",
        description: error.message || "An error occurred while adding the credential.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsAdding(false)
    }
  }

  const deleteCredential = async (id: string) => {
    try {
      const response = await fetch(`/api/cloud/credentials/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete cloud credential")
      }

      // Update the local cache
      mutate()

      toast({
        title: "Credential deleted",
        description: "The credential has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to delete credential",
        description: error.message || "An error occurred while deleting the credential.",
        variant: "destructive",
      })
    }
  }

  return {
    credentials: data || [],
    isLoading,
    isError: error,
    isAdding,
    addCredential,
    deleteCredential,
    mutate,
  }
}

export function useCloudDeployments() {
  const { toast } = useToast()
  const [isDeploying, setIsDeploying] = useState(false)

  const { data, error, isLoading, mutate } = useSWR("/api/cloud/deployments", fetcher, {
    refreshInterval: 10000, // Poll every 10 seconds to get deployment updates
    revalidateOnFocus: true,
  })

  const createDeployment = async (config: DeploymentConfig) => {
    try {
      setIsDeploying(true)
      const response = await fetch("/api/cloud/deployments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create deployment")
      }

      const newDeployment = await response.json()

      // Update the local cache
      mutate()

      toast({
        title: "Deployment created",
        description: `Deployment to ${config.provider} has been initiated.`,
      })

      return newDeployment
    } catch (error: any) {
      toast({
        title: "Failed to create deployment",
        description: error.message || "An error occurred while creating the deployment.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsDeploying(false)
    }
  }

  const cancelDeployment = async (id: string) => {
    try {
      const response = await fetch(`/api/cloud/deployments/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "cancel" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to cancel deployment")
      }

      // Update the local cache
      mutate()

      toast({
        title: "Deployment cancelled",
        description: "The deployment has been cancelled successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to cancel deployment",
        description: error.message || "An error occurred while cancelling the deployment.",
        variant: "destructive",
      })
    }
  }

  const terminateDeployment = async (id: string) => {
    try {
      const response = await fetch(`/api/cloud/deployments/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "terminate" }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to terminate deployment")
      }

      // Update the local cache
      mutate()

      toast({
        title: "Deployment terminated",
        description: "The deployment has been terminated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to terminate deployment",
        description: error.message || "An error occurred while terminating the deployment.",
        variant: "destructive",
      })
    }
  }

  return {
    deployments: data || [],
    isLoading,
    isError: error,
    isDeploying,
    createDeployment,
    cancelDeployment,
    terminateDeployment,
    mutate,
  }
}

export function useCloudDeployment(id: string) {
  const { data, error, isLoading, mutate } = useSWR(id ? `/api/cloud/deployments/${id}` : null, fetcher, {
    refreshInterval: 5000, // Poll every 5 seconds to get deployment updates
    revalidateOnFocus: true,
  })

  return {
    deployment: data,
    isLoading,
    isError: error,
    mutate,
  }
}
