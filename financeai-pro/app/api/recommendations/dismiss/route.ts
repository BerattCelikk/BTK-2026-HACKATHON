import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { addDays } from "date-fns"

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const body = await request.json()
    const { recommendationId } = body

    if (!recommendationId) return NextResponse.json({ error: "ID required" }, { status: 400 })

    await prisma.dismissedRecommendation.create({
      data: {
        userId: user.id,
        recommendationId,
        expiresAt: addDays(new Date(), 30)
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Dismiss Recommendation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
