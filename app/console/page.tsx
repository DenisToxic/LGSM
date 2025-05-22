"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { TerminalIcon, Send, Trash2, Loader2, AlertCircle, Wifi, WifiOff } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useConsole } from "@/lib/hooks/use-console"
import { useServers } from "@/lib/hooks/use-servers"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
// Add WebSocket context import
import { useWebSocket } from "@/lib/websocket-context"

export default function ConsolePage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [selectedServer, setSelectedServer] = useState("")
  const [command, setCommand] = useState("")
  const { servers, isLoading: serversLoading } = useServers()
  const { consoleOutput, isLoading: consoleLoading, isError, sendCommand, clearConsole } = useConsole(selectedServer)
  const consoleEndRef = useRef<HTMLDivElement>(null)

  // Inside the ConsolePage component, add the WebSocket context
  const { isConnected } = useWebSocket()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    // Scroll to bottom of console output when it changes
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [consoleOutput])

  // Set the first server as selected when servers are loaded
  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id)
    }
  }, [servers, selectedServer])

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim() || !selectedServer) return

    const success = await sendCommand(command)
    if (success) {
      setCommand("")
    }
  }

  const handleClearConsole = () => {
    clearConsole()
  }

  if (authLoading || !user) {
    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Server Console</h2>
      </div>

      <div className="grid gap-4 grid-cols-1">
        <Card className="col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Console</CardTitle>
                <CardDescription>View and interact with your server console</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Select
                  value={selectedServer}
                  onValueChange={setSelectedServer}
                  disabled={serversLoading || servers.length === 0}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={serversLoading ? "Loading servers..." : "Select server"} />
                  </SelectTrigger>
                  <SelectContent>
                    {servers.map((server) => (
                      <SelectItem key={server.id} value={server.id}>
                        {server.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleClearConsole}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Clear console</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                {isConnected ? (
                  <Badge variant="outline" className="ml-2 gap-1 border-green-500 text-green-500">
                    <Wifi className="h-3 w-3" />
                    <span className="text-xs">Real-time</span>
                  </Badge>
                ) : (
                  <Badge variant="outline" className="ml-2 gap-1 border-yellow-500 text-yellow-500">
                    <WifiOff className="h-3 w-3" />
                    <span className="text-xs">Polling</span>
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-black text-green-400 font-mono text-sm p-4 rounded-md h-[400px] overflow-y-auto">
                {consoleLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading console output...</span>
                  </div>
                ) : isError ? (
                  <div className="flex items-center justify-center h-full text-red-400">
                    <AlertCircle className="h-6 w-6 mr-2" />
                    <span>Failed to load console output. Please try again.</span>
                  </div>
                ) : !selectedServer ? (
                  <div className="flex items-center justify-center h-full">
                    <span>Please select a server to view console output.</span>
                  </div>
                ) : consoleOutput.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <span>No console output available.</span>
                  </div>
                ) : (
                  consoleOutput.map((line, index) => (
                    <div key={index} className="whitespace-pre-wrap break-all">
                      {line}
                    </div>
                  ))
                )}
                <div ref={consoleEndRef} />
              </div>

              <form onSubmit={handleCommandSubmit} className="flex space-x-2">
                <div className="relative flex-1">
                  <TerminalIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Type a command..."
                    className="pl-10"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    disabled={!selectedServer || consoleLoading}
                  />
                </div>
                <Button type="submit" disabled={!selectedServer || consoleLoading || !command.trim()}>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </Button>
              </form>

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => setCommand("help")} disabled={!selectedServer}>
                  help
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCommand("list")} disabled={!selectedServer}>
                  list
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCommand("version")} disabled={!selectedServer}>
                  version
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCommand("restart")} disabled={!selectedServer}>
                  restart
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setCommand("stop")} disabled={!selectedServer}>
                  stop
                </Button>
              </div>

              {servers.length > 0 && selectedServer && (
                <Alert variant="info" className="mt-4">
                  <AlertDescription>
                    <strong>Tip:</strong> You can use game-specific commands by prefixing them with a slash (e.g.,
                    /gamemode, /tp).
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
