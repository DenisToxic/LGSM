"use client"

import useSWR from "swr"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import type { BackupSchedule, BackupScheduleFrequency, BackupStorageType } from "@/lib/backup-store"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    error.message = await res.text()
    throw error
  }
  return res.json()
}

export function useBackupSchedules(serverId?: string) {
  const { toast } = useToast()
  const [isCreating, setIsCreating] = useState(false)

  const url = serverId ? `/api/backup-schedules?serverId=${serverId}` : "/api/backup-schedules"

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const createBackupSchedule = async (scheduleData: {
    serverId: string
    frequency: BackupScheduleFrequency
    cronExpression: string
    retention: number
    enabled: boolean
    storageType: BackupStorageType
  }) => {
    try {
      setIsCreating(true)
      const response = await fetch("/api/backup-schedules", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create backup schedule")
      }

      const newSchedule = await response.json()

      // Update the local cache
      mutate()

      toast({
        title: "Backup schedule created",
        description: `Backup schedule has been created successfully.`,
      })

      return newSchedule
    } catch (error: any) {
      toast({
        title: "Failed to create backup schedule",
        description: error.message || "An error occurred while creating the backup schedule.",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsCreating(false)
    }
  }

  const updateBackupSchedule = async (id: string, scheduleData: Partial<BackupSchedule>) => {
    try {
      const response = await fetch(`/api/backup-schedules/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(scheduleData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update backup schedule")
      }

      const updatedSchedule = await response.json()

      // Update the local cache
      mutate()

      toast({
        title: "Backup schedule updated",
        description: "The backup schedule has been updated successfully.",
      })

      return updatedSchedule
    } catch (error: any) {
      toast({
        title: "Failed to update backup schedule",
        description: error.message || "An error occurred while updating the backup schedule.",
        variant: "destructive",
      })
      throw error
    }
  }

  const deleteBackupSchedule = async (id: string) => {
    try {
      const response = await fetch(`/api/backup-schedules/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete backup schedule")
      }

      // Update the local cache
      mutate()

      toast({
        title: "Backup schedule deleted",
        description: "The backup schedule has been deleted successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to delete backup schedule",
        description: error.message || "An error occurred while deleting the backup schedule.",
        variant: "destructive",
      })
    }
  }

  return {
    schedules: data || [],
    isLoading,
    isError: error,
    isCreating,
    createBackupSchedule,
    updateBackupSchedule,
    deleteBackupSchedule,
    mutate,
  }
}
