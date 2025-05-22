"use client"

import useSWR from "swr"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { MetricThreshold, MetricType, MetricSeverity } from "@/lib/monitoring-store"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.message = await res.text()
    throw error
  }
  return res.json()
}

export function useThresholds() {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data, error, isLoading, mutate } = useSWR<MetricThreshold[]>("/api/monitoring/thresholds", fetcher, {
    revalidateOnFocus: true,
  })

  const createThreshold = async (thresholdData: {
    metricType: MetricType
    operator: "gt" | "lt" | "eq" | "gte" | "lte"
    value: number
    severity: MetricSeverity
    enabled: boolean
    serverId?: string
  }) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/monitoring/thresholds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(thresholdData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create threshold")
      }

      const newThreshold = await response.json()

      // Update the local cache
      mutate()

      toast({
        title: "Threshold created",
        description: `New threshold for ${newThreshold.metricType} has been created.`,
      })

      return newThreshold
    } catch (error: any) {
      toast({
        title: "Failed to create threshold",
        description: error.message || "An error occurred while creating the threshold.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateThreshold = async (
    id: string,
    thresholdData: Partial<{
      metricType: MetricType
      operator: "gt" | "lt" | "eq" | "gte" | "lte"
      value: number
      severity: MetricSeverity
      enabled: boolean
      serverId?: string
    }>,
  ) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/monitoring/thresholds/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(thresholdData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update threshold")
      }

      const updatedThreshold = await response.json()

      // Update the local cache
      mutate()

      toast({
        title: "Threshold updated",
        description: `The threshold for ${updatedThreshold.metricType} has been updated.`,
      })

      return updatedThreshold
    } catch (error: any) {
      toast({
        title: "Failed to update threshold",
        description: error.message || "An error occurred while updating the threshold.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const deleteThreshold = async (id: string) => {
    try {
      const response = await fetch(`/api/monitoring/thresholds/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete threshold")
      }

      // Update the local cache
      mutate()

      toast({
        title: "Threshold deleted",
        description: "The threshold has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to delete threshold",
        description: error.message || "An error occurred while deleting the threshold.",
        variant: "destructive",
      })
    }
  }

  return {
    thresholds: data || [],
    isLoading,
    isError: error,
    isSubmitting,
    createThreshold,
    updateThreshold,
    deleteThreshold,
    mutate,
  }
}
