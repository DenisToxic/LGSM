"use client"

import { useState, useEffect } from "react"
import type { ServerFormData } from "@/components/server-creation-wizard"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Trash2, Plus } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface ServerConfigStepProps {
  formData: ServerFormData
  updateFormData: (data: Partial<ServerFormData>) => void
  onNext: () => void
  onBack: () => void
  isLastStep: boolean
}

// Game-specific versions
const gameVersions: Record<string, string[]> = {
  minecraft: ["1.20.4", "1.19.4", "1.18.2", "1.17.1", "1.16.5", "latest"],
  csgo: ["latest"],
  valheim: ["0.217.22", "0.214.2", "latest"],
  terraria: ["1.4.4.9", "1.4.3.6", "latest"],
  rust: ["latest"],
  custom: ["custom"],
}

export function ServerConfigStep({ formData, updateFormData, onNext, onBack, isLastStep }: ServerConfigStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValid, setIsValid] = useState(false)
  const [newPropertyKey, setNewPropertyKey] = useState("")
  const [newPropertyValue, setNewPropertyValue] = useState("")

  // Get available versions based on game type
  const availableVersions = gameVersions[formData.gameType] || ["latest"]

  // Validate the form data
  useEffect(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.version) {
      newErrors.version = "Version is required"
    }

    if (!formData.port) {
      newErrors.port = "Port is required"
    } else if (formData.port < 1024 || formData.port > 65535) {
      newErrors.port = "Port must be between 1024 and 65535"
    }

    if (!formData.maxPlayers) {
      newErrors.maxPlayers = "Max players is required"
    } else if (formData.maxPlayers < 1) {
      newErrors.maxPlayers = "Max players must be at least 1"
    }

    setErrors(newErrors)
    setIsValid(Object.keys(newErrors).length === 0)
  }, [formData])

  const addServerProperty = () => {
    if (!newPropertyKey.trim() || !newPropertyValue.trim()) return

    const updatedProperties = {
      ...formData.serverProperties,
      [newPropertyKey]: newPropertyValue,
    }

    updateFormData({ serverProperties: updatedProperties })
    setNewPropertyKey("")
    setNewPropertyValue("")
  }

  const removeServerProperty = (key: string) => {
    const updatedProperties = { ...formData.serverProperties }
    delete updatedProperties[key]
    updateFormData({ serverProperties: updatedProperties })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="version">
          Game Version <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.version} onValueChange={(value) => updateFormData({ version: value })}>
          <SelectTrigger id="version">
            <SelectValue placeholder="Select version" />
          </SelectTrigger>
          <SelectContent>
            {availableVersions.map((version) => (
              <SelectItem key={version} value={version}>
                {version}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.version && <p className="text-sm text-red-500">{errors.version}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="port">
            Server Port <span className="text-red-500">*</span>
          </Label>
          <Input
            id="port"
            type="number"
            min={1024}
            max={65535}
            value={formData.port}
            onChange={(e) => updateFormData({ port: Number.parseInt(e.target.value) || 0 })}
          />
          {errors.port && <p className="text-sm text-red-500">{errors.port}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="max-players">
            Max Players <span className="text-red-500">*</span>
          </Label>
          <Input
            id="max-players"
            type="number"
            min={1}
            value={formData.maxPlayers}
            onChange={(e) => updateFormData({ maxPlayers: Number.parseInt(e.target.value) || 0 })}
          />
          {errors.maxPlayers && <p className="text-sm text-red-500">{errors.maxPlayers}</p>}
        </div>
      </div>

      <Separator className="my-4" />

      <div>
        <Label className="mb-2 block">Server Properties</Label>
        <Alert variant="info" className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Server properties are specific to each game type. Add key-value pairs to configure your server.
          </AlertDescription>
        </Alert>

        <div className="mb-4 space-y-4">
          {Object.entries(formData.serverProperties).map(([key, value]) => (
            <div key={key} className="flex items-center gap-2">
              <Input value={key} readOnly className="w-1/3 bg-muted" />
              <Input
                value={value}
                onChange={(e) => {
                  const updatedProperties = {
                    ...formData.serverProperties,
                    [key]: e.target.value,
                  }
                  updateFormData({ serverProperties: updatedProperties })
                }}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeServerProperty(key)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-2">
            <Label htmlFor="property-key">Property Key</Label>
            <Input
              id="property-key"
              placeholder="e.g., difficulty"
              value={newPropertyKey}
              onChange={(e) => setNewPropertyKey(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label htmlFor="property-value">Value</Label>
            <Input
              id="property-value"
              placeholder="e.g., normal"
              value={newPropertyValue}
              onChange={(e) => setNewPropertyValue(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={addServerProperty}
            disabled={!newPropertyKey.trim() || !newPropertyValue.trim()}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
