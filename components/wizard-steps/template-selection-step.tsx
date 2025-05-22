"use client"

import { useState } from "react"
import { Check, Info } from "lucide-react"
import type { ServerFormData } from "@/components/server-creation-wizard"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { serverTemplates } from "@/lib/server-templates"

interface TemplateSelectionStepProps {
  formData: ServerFormData
  updateFormData: (data: Partial<ServerFormData>) => void
  onNext: () => void
  onBack: () => void
  isLastStep: boolean
}

export function TemplateSelectionStep({ formData, updateFormData, onNext }: TemplateSelectionStepProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("all")

  // Filter templates based on search query and selected tab
  const filteredTemplates = serverTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    if (selectedTab === "all") {
      return matchesSearch
    }

    return matchesSearch && template.gameType === selectedTab
  })

  // Group templates by category for the "all" tab
  const groupedTemplates = filteredTemplates.reduce<Record<string, typeof serverTemplates>>((acc, template) => {
    const gameType = template.gameType
    if (!acc[gameType]) {
      acc[gameType] = []
    }
    acc[gameType].push(template)
    return acc
  }, {})

  const handleSelectTemplate = (templateId: string) => {
    updateFormData({ templateId })
    onNext()
  }

  const handleSkip = () => {
    updateFormData({ templateId: "" })
    onNext()
  }

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Choose a Server Template</h3>
        <Button variant="ghost" onClick={handleSkip}>
          Skip (Start from scratch)
        </Button>
      </div>

      <div className="relative">
        <Input
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="minecraft">Minecraft</TabsTrigger>
          <TabsTrigger value="csgo">CS:GO</TabsTrigger>
          <TabsTrigger value="valheim">Valheim</TabsTrigger>
          <TabsTrigger value="terraria">Terraria</TabsTrigger>
          <TabsTrigger value="rust">Rust</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {Object.entries(groupedTemplates).length === 0 ? (
            <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
              <p className="text-center text-muted-foreground">No templates found. Try a different search term.</p>
            </div>
          ) : (
            Object.entries(groupedTemplates).map(([gameType, templates]) => (
              <div key={gameType} className="space-y-3">
                <Label className="text-base capitalize">{gameType}</Label>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={formData.templateId === template.id}
                      onSelect={() => handleSelectTemplate(template.id)}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </TabsContent>

        {["minecraft", "csgo", "valheim", "terraria", "rust"].map((gameType) => (
          <TabsContent key={gameType} value={gameType}>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.filter((t) => t.gameType === gameType).length === 0 ? (
                <div className="col-span-full flex h-40 items-center justify-center rounded-md border border-dashed">
                  <p className="text-center text-muted-foreground">No templates found. Try a different search term.</p>
                </div>
              ) : (
                filteredTemplates
                  .filter((t) => t.gameType === gameType)
                  .map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={formData.templateId === template.id}
                      onSelect={() => handleSelectTemplate(template.id)}
                    />
                  ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

interface TemplateCardProps {
  template: {
    id: string
    name: string
    description: string
    gameType: string
    tags: string[]
    popular?: boolean
    new?: boolean
    config: ServerFormData
  }
  isSelected: boolean
  onSelect: () => void
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  // Generate game-specific background colors for template cards
  const getGameColor = (gameType: string) => {
    switch (gameType) {
      case "minecraft":
        return "bg-green-100 dark:bg-green-950"
      case "csgo":
        return "bg-orange-100 dark:bg-orange-950"
      case "valheim":
        return "bg-blue-100 dark:bg-blue-950"
      case "terraria":
        return "bg-purple-100 dark:bg-purple-950"
      case "rust":
        return "bg-red-100 dark:bg-red-950"
      default:
        return "bg-gray-100 dark:bg-gray-800"
    }
  }

  // Generate game-specific icons for template cards
  const getGameIcon = (gameType: string) => {
    switch (gameType) {
      case "minecraft":
        return "🧱"
      case "csgo":
        return "🔫"
      case "valheim":
        return "⚔️"
      case "terraria":
        return "🌍"
      case "rust":
        return "🏚️"
      default:
        return "🎮"
    }
  }

  return (
    <Card
      className={`cursor-pointer transition-all hover:border-primary ${isSelected ? "border-2 border-primary" : ""}`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{template.name}</CardTitle>
          {isSelected && <Check className="h-5 w-5 text-primary" />}
        </div>
        <CardDescription className="line-clamp-2 text-xs">{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className={`mb-3 flex h-24 items-center justify-center rounded-md ${getGameColor(template.gameType)}`}>
          <span className="text-4xl">{getGameIcon(template.gameType)}</span>
          <span className="ml-2 text-xl font-semibold capitalize">{template.gameType}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {template.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {template.popular && <Badge className="bg-green-500 text-xs">Popular</Badge>}
          {template.new && <Badge className="bg-blue-500 text-xs">New</Badge>}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-0">
        <span className="text-xs capitalize text-muted-foreground">{template.gameType}</span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => e.stopPropagation()}>
                <Info className="h-4 w-4" />
                <span className="sr-only">More info</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="max-w-[300px] space-y-2 p-4">
              <h4 className="font-medium">{template.name}</h4>
              <p className="text-sm">{template.description}</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="font-medium">CPU:</span> {template.config.cpu} cores
                </div>
                <div>
                  <span className="font-medium">Memory:</span> {template.config.memory} GB
                </div>
                <div>
                  <span className="font-medium">Storage:</span> {template.config.storage} GB
                </div>
                <div>
                  <span className="font-medium">Players:</span> {template.config.maxPlayers}
                </div>
                {template.config.enableMods && (
                  <div className="col-span-2">
                    <span className="font-medium">Mods:</span> {template.config.mods.length}
                  </div>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
}
