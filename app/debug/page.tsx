"use client"

import { useSession, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function DebugPage() {
  const { data: session, status } = useSession()
  const [serverSession, setServerSession] = useState(null)

  useEffect(() => {
    getSession().then(setServerSession)
  }, [])

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">useSession Hook:</h3>
            <pre className="bg-slate-100 p-2 rounded text-sm">{JSON.stringify({ status, session }, null, 2)}</pre>
          </div>

          <div>
            <h3 className="font-semibold">getSession():</h3>
            <pre className="bg-slate-100 p-2 rounded text-sm">{JSON.stringify(serverSession, null, 2)}</pre>
          </div>

          <div>
            <h3 className="font-semibold">Environment Variables:</h3>
            <pre className="bg-slate-100 p-2 rounded text-sm">
              {JSON.stringify(
                {
                  NODE_ENV: process.env.NODE_ENV,
                  NEXTAUTH_URL: typeof window !== "undefined" ? window.location.origin : "server-side",
                },
                null,
                2,
              )}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
