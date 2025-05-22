"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  Download,
  Trash2,
  MoreHorizontal,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  HardDrive,
  Cloud,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useBackups } from "@/lib/hooks/use-backups"
import type { Backup, BackupStatus, BackupStorageType } from "@/lib/backup-store"

interface BackupListProps {
  backups: Backup[]
}

export function BackupList({ backups }: BackupListProps) {
  const [backupToDelete, setBackupToDelete] = useState<string | null>(null)
  const [backupToRestore, setBackupToRestore] = useState<string | null>(null)

  const { deleteBackup, restoreBackup } = useBackups()

  const confirmDelete = (backupId: string) => {
    setBackupToDelete(backupId)
  }

  const handleDelete = () => {
    if (backupToDelete) {
      deleteBackup(backupToDelete)
      setBackupToDelete(null)
    }
  }

  const confirmRestore = (backupId: string) => {
    setBackupToRestore(backupId)
  }

  const handleRestore = () => {
    if (backupToRestore) {
      restoreBackup(backupToRestore)
      setBackupToRestore(null)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getStatusBadge = (status: BackupStatus) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="border-green-500 text-green-500 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="outline" className="border-red-500 text-red-500 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500 flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            In Progress
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Unknown
          </Badge>
        )
    }
  }

  const getStorageIcon = (storageType: BackupStorageType) => {
    switch (storageType) {
      case "local":
        return <HardDrive className="h-4 w-4" />
      case "cloud-s3":
      case "cloud-gcs":
      case "cloud-azure":
        return <Cloud className="h-4 w-4" />
      default:
        return <HardDrive className="h-4 w-4" />
    }
  }

  const getStorageLabel = (storageType: BackupStorageType): string => {
    switch (storageType) {
      case "local":
        return "Local Storage"
      case "cloud-s3":
        return "AWS S3"
      case "cloud-gcs":
        return "Google Cloud Storage"
      case "cloud-azure":
        return "Azure Blob Storage"
      default:
        return "Unknown"
    }
  }

  if (backups.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-10 text-center">
        <p className="text-muted-foreground">No backups found</p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-12 gap-4 p-4 font-medium border-b">
          <div className="col-span-3">Name</div>
          <div className="col-span-2">Server</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-1">Size</div>
          <div className="col-span-2">Storage</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1 text-right">Actions</div>
        </div>
        <div className="divide-y">
          {backups.map((backup) => (
            <div key={backup.id} className="grid grid-cols-12 gap-4 p-4 items-center">
              <div className="col-span-3 font-medium truncate" title={backup.fileName}>
                {backup.fileName}
                {backup.isAutomatic && (
                  <Badge variant="secondary" className="ml-2">
                    Auto
                  </Badge>
                )}
              </div>
              <div className="col-span-2 truncate">{backup.serverName}</div>
              <div className="col-span-2">{format(new Date(backup.createdAt), "MMM d, yyyy HH:mm")}</div>
              <div className="col-span-1">{formatFileSize(backup.size)}</div>
              <div className="col-span-2 flex items-center gap-1">
                {getStorageIcon(backup.storageType)}
                <span>{getStorageLabel(backup.storageType)}</span>
              </div>
              <div className="col-span-1">{getStatusBadge(backup.status)}</div>
              <div className="col-span-1 text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Backup Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => confirmRestore(backup.id)}
                      disabled={backup.status !== "completed"}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      <span>Restore</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="mr-2 h-4 w-4" />
                      <span>Download</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-500" onClick={() => confirmDelete(backup.id)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertDialog open={!!backupToDelete} onOpenChange={() => setBackupToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the backup file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!backupToRestore} onOpenChange={() => setBackupToRestore(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore from backup?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore your server to the state saved in this backup. The current state will be overwritten.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Restore</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
