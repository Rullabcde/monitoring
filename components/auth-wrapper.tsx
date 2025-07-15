"use client"

import type React from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Activity } from "lucide-react"

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    console.log("=== AUTH WRAPPER ===")
    console.log("Session status:", status)
    console.log("Session data:", session)

    if (status === "loading") {
      console.log("⏳ Session loading...")
      return
    }

    setIsChecking(false)

    if (status === "unauthenticated" || !session) {
      console.log("❌ Not authenticated, redirecting to login")
      router.push("/login")
      return
    }

    console.log("✅ Authenticated, showing content")
  }, [session, status, router])

  if (status === "loading" || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (status === "unauthenticated" || !session) {
    return null
  }

  return <>{children}</>
}
