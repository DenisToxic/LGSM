"use client"

import useSWR from "swr"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.message = await res.text()
    throw error
  }
  return res.json()
}

export function useDockerVolumes() {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)

  const { data, error, isLoading, mutate } = useSWR("/api/docker/volumes", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const createVolume = async (name: string) => {
    try {
      setIsCreating(true)
      const response = await fetch("/api/docker/volumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create volume")
      }

      const newVolume = await response.json()

      // Update the local cache
      mutate()

      toast({
        title: "Volume created",
        description: `${newVolume.name} has been created.`,
      })

      return newVolume
    } catch (error: any) {
      toast({
        title: "Failed to create volume",
        description: error.message || "An error occurred while creating the volume.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  return {
    volumes: data || [],
    isLoading,
    isError: error,
    isCreating,
    createVolume,
    mutate,
  }
}
