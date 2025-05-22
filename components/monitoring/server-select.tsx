"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Server } from "@/lib/server-store"

interface ServerSelectProps {
  servers: Server[]
  onChange: (serverId: string) => void
}

export function ServerSelect({ servers, onChange }: ServerSelectProps) {
  const [selectedServer, setSelectedServer] = useState<string>("")

  // If this is the first render and we have servers, default to the first one
  useEffect(() => {
    if (servers.length > 0 && !selectedServer) {
      setSelectedServer(servers[0].id)
      onChange(servers[0].id)
    }
  }, [servers, selectedServer, onChange])

  const handleServerChange = (value: string) => {
    setSelectedServer(value)
    onChange(value)
  }

  return (
    <div>
      <Select value={selectedServer} onValueChange={handleServerChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a server" />
        </SelectTrigger>
        <SelectContent>
          {servers.map((server) => (
            <SelectItem key={server.id} value={server.id}>
              {server.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="mt-4 space-y-2">
        {selectedServer && (
          <>
            <div className="text-sm">
              <span className="text-muted-foreground">Status: </span>
              <span
                className={`font-medium ${servers.find((s) => s.id === selectedServer)?.status === "online" ? "text-green-500" : "text-orange-500"}`}
              >
                {servers.find((s) => s.id === selectedServer)?.status}
              </span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Type: </span>
              <span className="font-medium">{servers.find((s) => s.id === selectedServer)?.gameType}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Players: </span>
              <span className="font-medium">
                {servers.find((s) => s.id === selectedServer)?.players.current} /{" "}
                {servers.find((s) => s.id === selectedServer)?.players.max}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
