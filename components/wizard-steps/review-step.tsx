"use client"

import type { ServerFormData } from "@/components/server-creation-wizard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle } from "lucide-react"

interface ReviewStepProps {
  formData: ServerFormData
  updateFormData: (data: Partial<ServerFormData>) => void
  onNext: () => void
  onBack: () => void
  isLastStep: boolean
}

export function ReviewStep({ formData, updateFormData, onNext, onBack, isLastStep }: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Review the basic server information.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Server Name</dt>
              <dd className="text-base">{formData.name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Game Type</dt>
              <dd className="text-base capitalize">{formData.gameType}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-sm font-medium text-muted-foreground">Description</dt>
              <dd className="text-base">{formData.description || "No description provided."}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Server Configuration</CardTitle>
          <CardDescription>Review the server configuration settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Version</dt>
              <dd className="text-base">{formData.version}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Port</dt>
              <dd className="text-base">{formData.port}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Max Players</dt>
              <dd className="text-base">{formData.maxPlayers}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Mods Enabled</dt>
              <dd className="text-base flex items-center">
                {formData.enableMods ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                {formData.enableMods ? "Yes" : "No"}
              </dd>
            </div>
            {formData.enableMods && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Mods</dt>
                <dd className="text-base flex flex-wrap gap-2 mt-1">
                  {formData.mods.length > 0 ? (
                    formData.mods.map((mod) => (
                      <Badge key={mod} variant="secondary">
                        {mod}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">No mods selected.</span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource Allocation</CardTitle>
          <CardDescription>Review the resource allocation settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">CPU</dt>
              <dd className="text-base">{formData.cpu}%</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Memory</dt>
              <dd className="text-base">{formData.memory} GB</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Storage</dt>
              <dd className="text-base">{formData.storage} GB</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Docker Container</dt>
              <dd className="text-base flex items-center">
                {formData.useDocker ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                {formData.useDocker ? "Yes" : "No"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced Settings</CardTitle>
          <CardDescription>Review the advanced server settings.</CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Automatic Backups</dt>
              <dd className="text-base flex items-center">
                {formData.backupEnabled ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                {formData.backupEnabled ? "Enabled" : "Disabled"}
              </dd>
            </div>
            {formData.backupEnabled && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Backup Schedule</dt>
                <dd className="text-base">{formData.backupSchedule}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Automatic Restart</dt>
              <dd className="text-base flex items-center">
                {formData.autoRestart ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500 mr-2" />
                )}
                {formData.autoRestart ? "Enabled" : "Disabled"}
              </dd>
            </div>
            {formData.autoRestart && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Restart Schedule</dt>
                <dd className="text-base">{formData.restartSchedule}</dd>
              </div>
            )}
            {formData.startupCommands && (
              <div className="col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Startup Commands</dt>
                <dd className="text-base font-mono bg-muted p-2 rounded-md mt-1 text-sm">{formData.startupCommands}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Create Server</Button>
      </div>
    </div>
  )
}
