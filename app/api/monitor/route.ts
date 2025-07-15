import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { monitorWebsite } from "@/lib/monitoring"

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const websites = await prisma.website.findMany({
      where: { isActive: true },
    })

    const results = await Promise.allSettled(
      websites.map((website) => monitorWebsite(website.id, website.url, website.type)),
    )

    const successful = results.filter((r) => r.status === "fulfilled").length
    const failed = results.filter((r) => r.status === "rejected").length

    return NextResponse.json({
      message: `Monitored ${websites.length} websites`,
      successful,
      failed,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to run monitoring" }, { status: 500 })
  }
}
