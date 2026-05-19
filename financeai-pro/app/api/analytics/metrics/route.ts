import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { calculateFinancialMetrics } from "@/lib/financial-metrics"

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const metrics = await calculateFinancialMetrics(user.id)

    return NextResponse.json(metrics)
  } catch (error) {
    console.error("Financial Metrics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
