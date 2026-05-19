import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

// In a real app, this would be a WebSocket server or SSE.
// For this hackathon, we're using a smart polling endpoint that simulates real-time data.

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // 1. Simulate Market Updates
    // We'll add slight random fluctuations to the base market prices
    const marketUpdates = [
      { symbol: "USD/TRY", price: 38.45 + (Math.random() * 0.1 - 0.05), changePercent: 0.12 },
      { symbol: "EUR/TRY", price: 41.20 + (Math.random() * 0.1 - 0.05), changePercent: -0.05 },
      { symbol: "BTC/USD", price: 68240 + (Math.random() * 200 - 100), changePercent: 2.45 },
      { symbol: "ETH/USD", price: 3450 + (Math.random() * 20 - 10), changePercent: 1.80 },
      { symbol: "GOLD/OZ", price: 2350 + (Math.random() * 5 - 2.5), changePercent: 0.40 },
    ]

    // 2. Fetch recent anomalies (last 30 seconds)
    const thirtySecondsAgo = new Date(Date.now() - 30000)
    const newAnomalies = await prisma.anomaly.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: thirtySecondsAgo }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({
      marketUpdates,
      newAnomalies,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Realtime API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
