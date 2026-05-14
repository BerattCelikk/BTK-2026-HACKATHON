import { NextRequest, NextResponse } from "next/server"
import { generateContent, generateChatResponse } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, messages, systemPrompt } = body

    if (messages && Array.isArray(messages)) {
      const response = await generateChatResponse(messages, systemPrompt)
      return NextResponse.json(response)
    }

    if (prompt) {
      const response = await generateContent(prompt, {
        temperature: body.temperature,
        maxOutputTokens: body.maxOutputTokens,
      })
      return NextResponse.json(response)
    }

    return NextResponse.json(
      { error: "Either prompt or messages required" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Gemini API error:", error)
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    )
  }
}
