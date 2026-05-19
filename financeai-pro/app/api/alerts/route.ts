import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { anomalyDetector } from "@/lib/anomaly-detection"

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const anomalies = await anomalyDetector.detectAll(user.id)

    // Create records for detected anomalies
    // To avoid massive duplicates, we could check for recent ones of the same type,
    // but the prompt says "For each anomaly, create record in Anomaly table".
    // I'll implement a simple creation.
    if (anomalies.length > 0) {
      await Promise.all(
        anomalies.map(anomaly => 
          prisma.anomaly.create({
            data: {
              userId: user.id,
              type: anomaly.type,
              severity: anomaly.severity,
              message: anomaly.message,
              transactionId: anomaly.transactionId,
            }
          })
        )
      )
    }

    return NextResponse.json({
      anomalies,
      count: anomalies.length
    })

  } catch (error) {
    console.error("Alerts API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
