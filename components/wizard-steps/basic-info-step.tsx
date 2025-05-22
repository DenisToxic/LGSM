// components/wizard-steps/basic-info-step.tsx
"use client"

import { useState, useEffect } from "react"
import type { GameType, ServerFormData } from "@/components/server-creation-wizard"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from 'lucide-react'

interface BasicInfoStepProps {
  formData: ServerFormData
  updateFormData: (data: Partial<ServerFormData>) => void
  onNext: () => void
  onBack: () => void
  isLastStep: boolean
}

const gameTypes = [
  { value: "minecraft", label: "Minecraft" },
  { value: "csgo", label: "Counter-Strike: Global Offensive" },
  { value: "valheim", label: "Valheim" },
  { value: "terraria", label: "Terraria" },
  { value: "rust", label: "Rust" },
  { value: "custom", label: "Custom" },
]

export function BasicInfoStep({ formData, updateFormData, onNext, onBack, isLastStep }: BasicInfoStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValid, setIsValid] = useState(false)

  // Validate the form data
  useEffect(() => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Server name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Server name must be at least 3 characters"
    }

    if (!formData.gameType) {
      newErrors.gameType = "Game type is required"
    }

    setErrors(newErrors)
    setIsValid(Object.keys(newErrors).length === 0)
  }, [formData])

  const handleGameTypeChange = (value: string) => {
    const gameType = value as GameType
    let port = formData.port

    // Set default port based on game type
    switch (gameType) {
      case "minecraft":
        port = 25565
        break
      case "csgo":
        port = 27015
        break
      case "valheim":
        port = 2456
        break
      case "terraria":
        port = 7777
        break
      case "rust":
        port = 28015
        break
      default:
        port = 8080
    }

    updateFormData({ gameType, port })
  }

  return (
    <div className="space-y-4">
      {formData.templateId && (
        <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You're using a template as a starting point. Feel free to customize any settings.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="server-name">
          Server Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="server-name"
          placeholder="My Awesome Server"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="game-type">
          Game Type <span className="text-red-500">*</span>
        </Label>
        <Select value={formData.gameType} onValueChange={handleGameTypeChange}>
          <SelectTrigger id="game-type">
            <SelectValue placeholder="Select game type" />
          </SelectTrigger>
          <SelectContent>
            {gameTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.gameType && <p className="text-sm text-red-500">{errors.gameType}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter a description for your server"
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={3}
        />
      </div>

      {formData.gameType === "custom" && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Custom game servers require additional configuration. You'll need to provide specific details in the
            following steps.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}