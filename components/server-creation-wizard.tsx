// components/server-creation-wizard.tsx
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BasicInfoStep } from "@/components/wizard-steps/basic-info-step"
import { TemplateSelectionStep } from "@/components/wizard-steps/template-selection-step"
import { ServerConfigStep } from "@/components/wizard-steps/server-config-step"
import { ResourceAllocationStep } from "@/components/wizard-steps/resource-allocation-step"
import { AdvancedSettingsStep } from "@/components/wizard-steps/advanced-settings-step"
import { ReviewStep } from "@/components/wizard-steps/review-step"
import { useServers } from "@/lib/hooks/use-servers"
import { useDockerContainers } from "@/lib/hooks/use-docker-containers"
import { dockerClient } from "@/lib/docker/docker-client"

export type ServerFormData = {
  name: string
  gameType: string
  description: string
  template: string
  version: string
  port: number
  maxPlayers: number
  serverProperties: Record<string, string>
  cpu: number
  memory: number
  storage: number
  enableMods: boolean
  mods: string[]
  startupCommands: string
  backupEnabled: boolean
  backupSchedule: string
  autoRestart: boolean
  restartSchedule: string
  useDocker: boolean
}

interface ServerCreationWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ServerCreationWizard({ open, onOpenChange }: ServerCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<ServerFormData>({
    name: "",
    gameType: "minecraft",
    description: "",
    template: "",
    version: "",
    port: 25565,
    maxPlayers: 10,
    serverProperties: {},
    cpu: 25,
    memory: 2,
    storage: 10,
    enableMods: false,
    mods: [],
    startupCommands: "",
    backupEnabled: false,
    backupSchedule: "0 0 * * *",
    autoRestart: false,
    restartSchedule: "0 4 * * *",
    useDocker: true,
  })

  const { createServer } = useServers()
  const { createContainer } = useDockerContainers()

  const steps = [
    { id: "basic-info", title: "Basic Info" },
    { id: "template", title: "Template" },
    { id: "server-config", title: "Server Config" },
    { id: "resources", title: "Resources" },
    { id: "advanced", title: "Advanced" },
    { id: "review", title: "Review" },
  ]

  const updateFormData = (data: Partial<ServerFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Create the server in the database
      const server = await createServer(formData)

      // If Docker is enabled, create a Docker container
      if (formData.useDocker) {
        const containerConfig = dockerClient.convertServerToDockerConfig(formData)
        await createContainer(containerConfig)
      }

      // Close the dialog
      onOpenChange(false)

      // Reset the form
      setCurrentStep(0)
      setFormData({
        name: "",
        gameType: "minecraft",
        description: "",
        template: "",
        version: "",
        port: 25565,
        maxPlayers: 10,
        serverProperties: {},
        cpu: 25,
        memory: 2,
        storage: 10,
        enableMods: false,
        mods: [],
        startupCommands: "",
        backupEnabled: false,
        backupSchedule: "0 0 * * *",
        autoRestart: false,
        restartSchedule: "0 4 * * *",
        useDocker: true,
      })
    } catch (error) {
      console.error("Error creating server:", error)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <BasicInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            isLastStep={false}
          />
        )
      case 1:
        return (
          <TemplateSelectionStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            isLastStep={false}
          />
        )
      case 2:
        return (
          <ServerConfigStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            isLastStep={false}
          />
        )
      case 3:
        return (
          <ResourceAllocationStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            isLastStep={false}
          />
        )
      case 4:
        return (
          <AdvancedSettingsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            isLastStep={false}
          />
        )
      case 5:
        return (
          <ReviewStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleSubmit}
            onBack={handleBack}
            isLastStep={true}
          />
        )
      default:
        return null
    }
  }

  // Determine if the current step is valid
  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== "" && formData.gameType !== "";
      // Add validation for other steps as needed
      default:
        return true;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Create New Server</DialogTitle>
          <DialogDescription>Configure your new game server. Follow the steps to set up your server.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Tabs value={steps[currentStep].id} className="w-full">
            <TabsList className="grid grid-cols-6 mb-8">
              {steps.map((step, index) => (
                <TabsTrigger
                  key={step.id}
                  value={step.id}
                  disabled={true}
                  className={index <= currentStep ? "text-primary" : ""}
                >
                  {step.title}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value={steps[currentStep].id}>{renderStepContent()}</TabsContent>
          </Tabs>
        </div>

        {/* Add DialogFooter with navigation buttons */}
        <DialogFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          
          <Button 
            onClick={currentStep === steps.length - 1 ? handleSubmit : handleNext}
            disabled={!isStepValid()}
          >
            {currentStep === steps.length - 1 ? "Create Server" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}