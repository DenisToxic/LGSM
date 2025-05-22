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

export function useDockerImages() {
  const { toast } = useToast()
  const [isPulling, setIsPulling] = useState(false)

  const { data, error, isLoading, mutate } = useSWR("/api/docker/images", fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const pullImage = async (repository: string, tag = "latest") => {
    try {
      setIsPulling(true)
      const response = await fetch("/api/docker/images", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ repository, tag }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to pull image")
      }

      const newImage = await response.json()

      // Update the local cache
      mutate()

      toast({
        title: "Image pulled",
        description: `${newImage.repository}:${newImage.tag} has been pulled.`,
      })

      return newImage
    } catch (error: any) {
      toast({
        title: "Failed to pull image",
        description: error.message || "An error occurred while pulling the image.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsPulling(false)
    }
  }

  return {
    images: data || [],
    isLoading,
    isError: error,
    isPulling,
    pullImage,
    mutate,
  }
}
