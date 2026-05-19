import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { orchestratorV2 } from "@/agents/orchestrator/orchestrator-v2"
import { agentCache } from "@/lib/agent-cache"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ agentId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { agentId } = await params
    const body = await request.json()
    const { query, context, historyLimit } = body

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Rate Limiting (Simple check)
    const rateLimitKey = `rate-limit-${userId}`
    const lastRequest = agentCache.get<number>(rateLimitKey)
    if (lastRequest && Date.now() - lastRequest < 2000) { // 2s throttle
       return NextResponse.json({ error: "Too many requests. Please wait." }, { status: 429 })
    }
    agentCache.set(rateLimitKey, Date.now(), 60000)

    const result = await orchestratorV2.processQuery(query, userId, {
      forceAgent: agentId === "auto" ? undefined : agentId,
      context,
      historyLimit: historyLimit || 5
    })

    return NextResponse.json(result)

  } catch (error) {
    console.error("Agent API V2 Error:", error)
    return NextResponse.json(
      { error: "Internal server error", response: "Bir hata oluştu." },
      { status: 500 }
    )
  }
}
