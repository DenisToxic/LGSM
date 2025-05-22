"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Server, Users, Settings, Terminal, Cloud, Download, Box, BarChart } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed: boolean
}

export function AppSidebar({ className, isCollapsed }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea className="flex-1">
        <div className={cn("flex flex-col gap-2 p-2", isCollapsed && "items-center")}>
          <Button
            variant="ghost"
            className={cn("w-full justify-start", isCollapsed && "justify-center", pathname === "/" && "bg-accent")}
            asChild
          >
            <Link href="/">
              <LayoutDashboard className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>Dashboard</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center",
              pathname === "/servers" && "bg-accent",
            )}
            asChild
          >
            <Link href="/servers">
              <Server className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>Servers</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center",
              pathname === "/console" && "bg-accent",
            )}
            asChild
          >
            <Link href="/console">
              <Terminal className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>Console</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center",
              pathname === "/monitoring" && "bg-accent",
            )}
            asChild
          >
            <Link href="/monitoring">
              <BarChart className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>Monitoring</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center",
              pathname === "/backups" && "bg-accent",
            )}
            asChild
          >
            <Link href="/backups">
              <Download className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>Backups</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center",
              pathname === "/docker" && "bg-accent",
            )}
            asChild
          >
            <Link href="/docker">
              <Box className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>Docker</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center",
              pathname === "/cloud" && "bg-accent",
            )}
            asChild
          >
            <Link href="/cloud">
              <Cloud className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>Cloud</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center",
              pathname === "/users" && "bg-accent",
            )}
            asChild
          >
            <Link href="/users">
              <Users className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>Users</span>}
            </Link>
          </Button>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start",
              isCollapsed && "justify-center",
              pathname === "/settings" && "bg-accent",
            )}
            asChild
          >
            <Link href="/settings">
              <Settings className={cn("h-5 w-5", isCollapsed ? "mr-0" : "mr-2")} />
              {!isCollapsed && <span>Settings</span>}
            </Link>
          </Button>
        </div>
      </ScrollArea>
    </div>
  )
}
