"use client"

import type React from "react"
import { addActivity } from "@/lib/server-store"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  username: string
  email: string
  role: "administrator" | "moderator" | "server_manager"
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (username: string, email: string, password: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// In a real application, this would be replaced with a database or API call
const validUsers = [
  {
    id: "1",
    username: "admin",
    email: "admin@example.com",
    password: "password", // In a real app, this would be hashed
    role: "administrator" as const,
  },
  {
    id: "2",
    username: "moderator",
    email: "mod@example.com",
    password: "password", // In a real app, this would be hashed
    role: "moderator" as const,
  },
  {
    id: "3",
    username: "server",
    email: "server@example.com",
    password: "password", // In a real app, this would be hashed
    role: "server_manager" as const,
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // In a real app, this would be an API call to validate the session
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          setUser(JSON.parse(storedUser))
        }
      } catch (error) {
        console.error("Authentication error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // In a real app, this would be an API call to authenticate
      const foundUser = validUsers.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password)

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser
        setUser(userWithoutPassword)
        localStorage.setItem("user", JSON.stringify(userWithoutPassword))

        // Add login activity
        addActivity({
          type: "user_login",
          message: `User "${userWithoutPassword.username}" logged in`,
          user: userWithoutPassword.username,
        })
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    if (user) {
      // Add logout activity
      addActivity({
        type: "user_logout",
        message: `User "${user.username}" logged out`,
        user: user.username,
      })
    }

    setUser(null)
    localStorage.removeItem("user")
  }

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true)
    try {
      // Check if user already exists
      if (validUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("User with this email already exists")
      }

      // In a real app, this would be an API call to register a new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        email,
        role: "server_manager",
      }

      // In a real app, we would add the user to the database here
      // For this demo, we'll just set the user in state
      setUser(newUser)
      localStorage.setItem("user", JSON.stringify(newUser))

      // Add registration activity
      addActivity({
        type: "user_registration",
        message: `New user "${newUser.username}" registered`,
        user: newUser.username,
      })
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
