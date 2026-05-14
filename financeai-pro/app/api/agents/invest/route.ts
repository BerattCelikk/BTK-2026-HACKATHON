import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { riskProfile, amount, horizon } = body

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Geçerli tutar girin" }, { status: 400 })
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
${riskProfile} risk profili ile ${Number(amount).toLocaleString("tr-TR")} TL için ${horizon || 5} yıllık yatırım portföyü oluştur.
Sadece JSON formatında yanıt ver, başka metin ekleme:
{
  "allocation": { "stocks": 0.40, "bonds": 0.30, "cash": 0.20, "crypto": 0.10 },
  "expectedReturn": 0.12,
  "riskLevel": "moderate",
  "description": "kısa Türkçe açıklama"
}

Risk profiline göre allocation şu şekilde olmalı:
- conservative: stocks=0.10, bonds=0.50, cash=0.35, crypto=0.05, expectedReturn=0.06
- moderate: stocks=0.40, bonds=0.30, cash=0.20, crypto=0.10, expectedReturn=0.12
- aggressive: stocks=0.60, bonds=0.15, cash=0.05, crypto=0.20, expectedReturn=0.18
- very_aggressive: stocks=0.70, bonds=0.05, cash=0.05, crypto=0.20, expectedReturn=0.22
`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
      throw new Error("Invalid response format")
    }

    const allocation = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      success: true,
      allocation,
      amount: Number(amount),
      horizon: horizon || 5,
      riskProfile,
    })
  } catch (error) {
    console.error("Invest error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    )
  }
}
