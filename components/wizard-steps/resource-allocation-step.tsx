"use client"

import { useState, useEffect } from "react"
import type { ServerFormData } from "@/components/server-creation-wizard"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface ResourceAllocationStepProps {
  formData: ServerFormData
  updateFormData: (data: Partial<ServerFormData>) => void
  onNext: () => void
  onBack: () => void
  isLastStep: boolean
}

export function ResourceAllocationStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  isLastStep,
}: ResourceAllocationStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValid, setIsValid] = useState(false)

  // Validate the form data
  useEffect(() => {
    const newErrors: Record<string, string> = {}

    if (formData.cpu < 5) {
      newErrors.cpu = "CPU allocation must be at least 5%"
    }

    if (formData.memory < 1) {
      newErrors.memory = "Memory allocation must be at least 1GB"
    }

    if (formData.storage < 1) {
      newErrors.storage = "Storage allocation must be at least 1GB"
    }

    setErrors(newErrors)
    setIsValid(Object.keys(newErrors).length === 0)
  }, [formData])

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="use-docker">Use Docker Container</Label>
          <Switch
            id="use-docker"
            checked={formData.useDocker}
            onCheckedChange={(checked) => updateFormData({ useDocker: checked })}
          />
        </div>
        <Alert variant="info">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Docker containers provide better isolation and resource management for your game servers.
          </AlertDescription>
        </Alert>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="cpu-allocation">CPU Allocation</Label>
            <span className="text-sm font-medium">{formData.cpu}%</span>
          </div>
          <Slider
            id="cpu-allocation"
            min={5}
            max={100}
            step={5}
            value={[formData.cpu]}
            onValueChange={(value) => updateFormData({ cpu: value[0] })}
          />
          {errors.cpu && <p className="text-sm text-red-500">{errors.cpu}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="memory-allocation">Memory Allocation</Label>
            <span className="text-sm font-medium">{formData.memory} GB</span>
          </div>
          <Slider
            id="memory-allocation"
            min={1}
            max={16}
            step={1}
            value={[formData.memory]}
            onValueChange={(value) => updateFormData({ memory: value[0] })}
          />
          {errors.memory && <p className="text-sm text-red-500">{errors.memory}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="storage-allocation">Storage Allocation</Label>
            <span className="text-sm font-medium">{formData.storage} GB</span>
          </div>
          <Slider
            id="storage-allocation"
            min={1}
            max={100}
            step={1}
            value={[formData.storage]}
            onValueChange={(value) => updateFormData({ storage: value[0] })}
          />
          {errors.storage && <p className="text-sm text-red-500">{errors.storage}</p>}
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Next
        </Button>
      </div>
    </div>
  )
}
