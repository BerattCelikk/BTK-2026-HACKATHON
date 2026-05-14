import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import prisma from "@/lib/prisma"

const categoryMap: Record<string, string> = {
  salary: "SALARY",
  freelance: "FREELANCE",
  investment: "INVESTMENT",
  rent: "RENT",
  utilities: "UTILITIES",
  groceries: "GROCERIES",
  dining: "DINING",
  restaurant: "DINING",
  food: "GROCERIES",
  transportation: "TRANSPORTATION",
  transport: "TRANSPORTATION",
  healthcare: "HEALTHCARE",
  health: "HEALTHCARE",
  entertainment: "ENTERTAINMENT",
  shopping: "SHOPPING",
  education: "EDUCATION",
  savings: "SAVINGS",
  insurance: "INSURANCE",
  debt: "DEBT_PAYMENT",
  other: "OTHER",
}

function mapCategory(raw: string): string {
  const key = raw.toLowerCase().trim()
  return categoryMap[key] || "OTHER"
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("image") as File | null

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString("base64")
    const mimeType = file.type || "image/jpeg"

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `Bu fiş/fatura görselini analiz et. Sadece aşağıdaki JSON formatında yanıt ver, başka metin ekleme:
{
  "amount": 0.00,
  "category": "GROCERIES",
  "description": "kısa açıklama"
}

Kategorilerden biri olmalı: SALARY, FREELANCE, INVESTMENT, RENT, UTILITIES, GROCERIES, DINING, TRANSPORTATION, HEALTHCARE, ENTERTAINMENT, SHOPPING, EDUCATION, SAVINGS, INSURANCE, DEBT_PAYMENT, OTHER`

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType, data: base64 } },
    ])

    const responseText = result.response.text()
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse receipt", raw: responseText }, { status: 422 })
    }

    let parsed: { amount: number; category: string; description: string }
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      const cleaned = jsonMatch[0].replace(/(\w+):/g, '"$1":')
      parsed = JSON.parse(cleaned)
    }

    const amount = Math.abs(parsed.amount || 0)
    if (amount <= 0) {
      return NextResponse.json({ error: "Could not extract amount from receipt" }, { status: 422 })
    }

    const category = mapCategory(parsed.category || "OTHER")
    const description = (parsed.description || "Fiş/fatura").substring(0, 200)

    const transaction = await prisma.transaction.create({
      data: {
        userId: dbUser.id,
        type: "EXPENSE",
        category: category as any,
        amount,
        description,
        date: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount,
        category,
        description,
      },
    })
  } catch (error) {
    console.error("Receipt vision error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
