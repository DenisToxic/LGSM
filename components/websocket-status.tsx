"use client"

import { useWebSocket } from "@/lib/websocket-context"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Wifi, WifiOff } from "lucide-react"

export function WebSocketStatus() {
  const { isConnected, reconnect } = useWebSocket()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            {isConnected ? (
              <Badge variant="outline" className="gap-1 border-green-500 text-green-500">
                <Wifi className="h-3 w-3" />
                <span className="text-xs">Connected</span>
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 border-red-500 text-red-500 cursor-pointer" onClick={reconnect}>
                <WifiOff className="h-3 w-3" />
                <span className="text-xs">Disconnected</span>
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          {isConnected ? "Connected to real-time updates" : "Disconnected from real-time updates. Click to reconnect."}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
