// This file manages backup data and operations

import { v4 as uuidv4 } from "uuid"
import { getServerById } from "./server-store"
import { addActivity } from "./server-store"

export type BackupStorageType = "local" | "cloud-s3" | "cloud-gcs" | "cloud-azure"

export type BackupStatus = "pending" | "in_progress" | "completed" | "failed"

export type BackupScheduleFrequency = "hourly" | "daily" | "weekly" | "monthly" | "custom"

export interface BackupSchedule {
  id: string
  serverId: string
  frequency: BackupScheduleFrequency
  cronExpression: string
  retention: number // Number of backups to keep
  enabled: boolean
  storageType: BackupStorageType
  createdAt: string
  updatedAt: string
}

export interface Backup {
  id: string
  serverId: string
  serverName: string
  fileName: string
  size: number // Size in bytes
  storageType: BackupStorageType
  storageLocation: string
  status: BackupStatus
  isAutomatic: boolean
  scheduleId?: string
  createdAt: string
  completedAt?: string
  notes?: string
}

// In-memory stores
const backups: Backup[] = []
const backupSchedules: BackupSchedule[] = []

// Backup methods
export function getBackups(serverId?: string): Backup[] {
  if (serverId) {
    return [...backups].filter((backup) => backup.serverId === serverId)
  }
  return [...backups]
}

export function getBackupById(id: string): Backup | undefined {
  return backups.find((backup) => backup.id === id)
}

export function createBackup(serverId: string, isAutomatic = false, scheduleId?: string): Backup | null {
  const server = getServerById(serverId)
  if (!server) return null

  const newBackup: Backup = {
    id: `backup-${uuidv4()}`,
    serverId,
    serverName: server.name,
    fileName: `${server.name.toLowerCase().replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}-${Date.now()}.zip`,
    size: Math.floor(Math.random() * 1000000000) + 10000000, // Random size between 10MB and 1GB
    storageType: "local", // Default to local storage
    storageLocation: `/backups/${serverId}/`,
    status: "pending",
    isAutomatic,
    scheduleId,
    createdAt: new Date().toISOString(),
  }

  backups.push(newBackup)

  // Add activity
  addActivity({
    type: "backup",
    message: `Backup started for server "${server.name}"`,
    server: server.name,
    serverId: server.id,
  })

  // Simulate backup process
  simulateBackupProcess(newBackup)

  return newBackup
}

export function updateBackup(id: string, data: Partial<Backup>): Backup | null {
  const backupIndex = backups.findIndex((backup) => backup.id === id)
  if (backupIndex === -1) return null

  const updatedBackup = {
    ...backups[backupIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  backups[backupIndex] = updatedBackup
  return updatedBackup
}

export function deleteBackup(id: string): boolean {
  const backupIndex = backups.findIndex((backup) => backup.id === id)
  if (backupIndex === -1) return false

  const backup = backups[backupIndex]
  backups.splice(backupIndex, 1)

  // Add activity
  const server = getServerById(backup.serverId)
  if (server) {
    addActivity({
      type: "backup",
      message: `Backup deleted for server "${server.name}"`,
      server: server.name,
      serverId: server.id,
    })
  }

  return true
}

// Backup schedule methods
export function getBackupSchedules(serverId?: string): BackupSchedule[] {
  if (serverId) {
    return [...backupSchedules].filter((schedule) => schedule.serverId === serverId)
  }
  return [...backupSchedules]
}

export function getBackupScheduleById(id: string): BackupSchedule | undefined {
  return backupSchedules.find((schedule) => schedule.id === id)
}

export function createBackupSchedule(data: Omit<BackupSchedule, "id" | "createdAt" | "updatedAt">): BackupSchedule {
  const newSchedule: BackupSchedule = {
    ...data,
    id: `schedule-${uuidv4()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  backupSchedules.push(newSchedule)

  // Add activity
  const server = getServerById(data.serverId)
  if (server) {
    addActivity({
      type: "backup",
      message: `Backup schedule created for server "${server.name}"`,
      server: server.name,
      serverId: server.id,
    })
  }

  return newSchedule
}

export function updateBackupSchedule(id: string, data: Partial<BackupSchedule>): BackupSchedule | null {
  const scheduleIndex = backupSchedules.findIndex((schedule) => schedule.id === id)
  if (scheduleIndex === -1) return null

  const updatedSchedule = {
    ...backupSchedules[scheduleIndex],
    ...data,
    updatedAt: new Date().toISOString(),
  }

  backupSchedules[scheduleIndex] = updatedSchedule
  return updatedSchedule
}

export function deleteBackupSchedule(id: string): boolean {
  const scheduleIndex = backupSchedules.findIndex((schedule) => schedule.id === id)
  if (scheduleIndex === -1) return false

  const schedule = backupSchedules[scheduleIndex]
  backupSchedules.splice(scheduleIndex, 1)

  // Add activity
  const server = getServerById(schedule.serverId)
  if (server) {
    addActivity({
      type: "backup",
      message: `Backup schedule deleted for server "${server.name}"`,
      server: server.name,
      serverId: server.id,
    })
  }

  return true
}

// Restore methods
export function restoreBackup(backupId: string): boolean {
  const backup = getBackupById(backupId)
  if (!backup || backup.status !== "completed") return false

  const server = getServerById(backup.serverId)
  if (!server) return false

  // Simulate restore process
  simulateRestoreProcess(backup)

  return true
}

// Helper functions
function simulateBackupProcess(backup: Backup) {
  // Update status to in_progress
  updateBackup(backup.id, { status: "in_progress" })

  // Simulate backup process time (between 5-15 seconds)
  const processingTime = Math.floor(Math.random() * 10000) + 5000

  setTimeout(() => {
    // 95% chance of success
    const success = Math.random() < 0.95

    if (success) {
      updateBackup(backup.id, {
        status: "completed",
        completedAt: new Date().toISOString(),
      })

      // Add activity
      const server = getServerById(backup.serverId)
      if (server) {
        addActivity({
          type: "backup",
          message: `Backup completed for server "${server.name}"`,
          server: server.name,
          serverId: server.id,
        })
      }
    } else {
      updateBackup(backup.id, { status: "failed" })

      // Add activity
      const server = getServerById(backup.serverId)
      if (server) {
        addActivity({
          type: "error",
          message: `Backup failed for server "${server.name}"`,
          server: server.name,
          serverId: server.id,
        })
      }
    }
  }, processingTime)
}

function simulateRestoreProcess(backup: Backup) {
  // Add activity for restore started
  const server = getServerById(backup.serverId)
  if (server) {
    addActivity({
      type: "backup",
      message: `Restore started from backup for server "${server.name}"`,
      server: server.name,
      serverId: server.id,
    })
  }

  // Simulate restore process time (between 10-30 seconds)
  const processingTime = Math.floor(Math.random() * 20000) + 10000

  setTimeout(() => {
    // 90% chance of success
    const success = Math.random() < 0.9

    if (success) {
      // Add activity for successful restore
      if (server) {
        addActivity({
          type: "backup",
          message: `Restore completed successfully for server "${server.name}"`,
          server: server.name,
          serverId: server.id,
        })
      }
    } else {
      // Add activity for failed restore
      if (server) {
        addActivity({
          type: "error",
          message: `Restore failed for server "${server.name}"`,
          server: server.name,
          serverId: server.id,
        })
      }
    }
  }, processingTime)
}

// Initialize with some sample backup schedules
export function initializeBackupStore() {
  // This would be called when the application starts
  // For now, we'll leave it empty as we don't have any servers yet
}

// Start the backup scheduler
export function startBackupScheduler() {
  // Check every minute if any backups need to be created based on schedules
  setInterval(() => {
    const now = new Date()

    backupSchedules.forEach((schedule) => {
      if (!schedule.enabled) return

      // This is a simplified check - in a real app, you'd use a proper cron parser
      const shouldRunNow = checkIfScheduleShouldRunNow(schedule, now)

      if (shouldRunNow) {
        createBackup(schedule.serverId, true, schedule.id)
      }
    })
  }, 60000) // Check every minute
}

function checkIfScheduleShouldRunNow(schedule: BackupSchedule, now: Date): boolean {
  // This is a simplified implementation
  // In a real app, you'd use a proper cron parser library

  const minute = now.getMinutes()
  const hour = now.getHours()
  const dayOfMonth = now.getDate()
  const dayOfWeek = now.getDay()

  switch (schedule.frequency) {
    case "hourly":
      // Run at the top of every hour
      return minute === 0

    case "daily":
      // Run at midnight every day
      return hour === 0 && minute === 0

    case "weekly":
      // Run at midnight on Sunday
      return dayOfWeek === 0 && hour === 0 && minute === 0

    case "monthly":
      // Run at midnight on the 1st of the month
      return dayOfMonth === 1 && hour === 0 && minute === 0

    case "custom":
      // For custom schedules, we'd need to parse the cron expression
      // This is just a placeholder - in a real app, use a cron parser
      return false

    default:
      return false
  }
}

// Initialize the backup store
initializeBackupStore()

// Start the backup scheduler
startBackupScheduler()
