import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const websites = await prisma.website.findMany({
      include: {
        statusChecks: {
          orderBy: { checkedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(websites)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch websites" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { name, url, type } = await request.json()

    if (!name || !url || !type) {
      return NextResponse.json({ error: "Name, URL, and type are required" }, { status: 400 })
    }

    const website = await prisma.website.create({
      data: { name, url, type },
    })

    return NextResponse.json(website)
  } catch (error) {
    return NextResponse.json({ error: "Failed to create website" }, { status: 500 })
  }
}
