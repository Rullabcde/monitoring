import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const statusChecks = await prisma.statusCheck.findMany({
      where: {
        websiteId: params.id,
        checkedAt: {
          gte: threeDaysAgo,
        },
      },
      orderBy: { checkedAt: "desc" },
    })

    return NextResponse.json(statusChecks)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 })
  }
}
