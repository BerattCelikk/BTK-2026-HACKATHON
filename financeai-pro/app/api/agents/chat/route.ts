import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { orchestrator } from "@/agents/orchestrator"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { query, context } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const result = await orchestrator.processQuery(query, userId, context || {}, [])

    return NextResponse.json(result)
  } catch (error) {
    console.error("Agent chat error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        finalResponse: "Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      },
      { status: 500 }
    )
  }
}
