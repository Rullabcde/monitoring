import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { monitorWebsite } from "@/lib/monitoring"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { websiteId, url, type } = await request.json()

    if (!websiteId || !url || !type) {
      return NextResponse.json({ error: "Website ID, URL, and type are required" }, { status: 400 })
    }

    const result = await monitorWebsite(websiteId, url, type)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to monitor website" }, { status: 500 })
  }
}
