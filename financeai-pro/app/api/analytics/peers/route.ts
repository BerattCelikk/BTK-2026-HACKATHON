import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { compareToPeers } from "@/lib/peer-comparison"

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const peers = await compareToPeers(user.id)

    return NextResponse.json(peers)
  } catch (error) {
    console.error("Peer Comparison API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
