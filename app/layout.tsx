import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { WebSocketProvider } from "@/lib/websocket-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Game Server Management System",
  description: "A comprehensive web-based Game Server Management System",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <WebSocketProvider>
              <SidebarProvider>
                <div className="flex h-screen">
                  <AppSidebar />
                  <main className="flex-1 overflow-auto">{children}</main>
                </div>
                <Toaster />
              </SidebarProvider>
            </WebSocketProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
