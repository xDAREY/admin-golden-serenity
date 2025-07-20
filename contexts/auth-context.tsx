"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { getFirebaseAuth } from "@/lib/firebase-client"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isLoggingOut: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let unsubscribe: () => void

    const init = async () => {
      try {
        const auth = await getFirebaseAuth()

        unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user)
          setLoading(false)
          // Reset logout state when auth state changes
          if (!user) {
            setIsLoggingOut(false)
          }
        })
      } catch (error) {
        setLoading(false)
      }
    }

    init()

    return () => {
      if (unsubscribe) unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const auth = await getFirebaseAuth()
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    setIsLoggingOut(true)
    try {
      const auth = await getFirebaseAuth()
      
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 800))
      
      await signOut(auth)
      
      // Optional: Clear any cached data, localStorage, etc.
      // localStorage.removeItem('someUserData')
      
    } catch (error) {
      setIsLoggingOut(false)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isLoggingOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}