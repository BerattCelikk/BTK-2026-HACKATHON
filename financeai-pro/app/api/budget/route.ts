import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

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

    const body = await request.json()
    const { type, category, amount, description, date } = body

    if (!type || !["INCOME", "EXPENSE"].includes(type)) {
      return NextResponse.json({ error: "Geçersiz işlem türü" }, { status: 400 })
    }

    if (!category || typeof category !== "string") {
      return NextResponse.json({ error: "Kategori gerekli" }, { status: 400 })
    }

    const parsedAmount = Number(amount)
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json({ error: "Geçerli bir tutar girin" }, { status: 400 })
    }

    const validCategories = [
      "SALARY", "FREELANCE", "INVESTMENT", "RENT", "UTILITIES",
      "GROCERIES", "DINING", "TRANSPORTATION", "HEALTHCARE",
      "ENTERTAINMENT", "SHOPPING", "EDUCATION", "SAVINGS",
      "INSURANCE", "DEBT_PAYMENT", "OTHER",
    ]
    const resolvedCategory = validCategories.includes(category) ? category : "OTHER"

    const descriptionStr = (description || "").toString().trim().substring(0, 200)
    const transactionDate = date ? new Date(date) : new Date()

    if (transactionDate > new Date()) {
      return NextResponse.json({ error: "Gelecek tarih girilemez" }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: dbUser.id,
        type: type as any,
        category: resolvedCategory as any,
        amount: parsedAmount,
        description: descriptionStr,
        date: transactionDate,
      },
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        type: transaction.type,
        category: transaction.category,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.date.toISOString().split("T")[0],
      },
    })
  } catch (error) {
    console.error("Budget POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const [budgets, transactions] = await Promise.all([
      prisma.budget.findMany({
        where: { userId: dbUser.id, month: currentMonth, year: currentYear },
      }),
      prisma.transaction.findMany({
        where: {
          userId: dbUser.id,
          date: {
            gte: new Date(currentYear, now.getMonth(), 1),
            lt: new Date(currentYear, now.getMonth() + 1, 1),
          },
        },
      }),
    ])

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((s, t) => s + t.amount, 0)

    const totalExpenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((s, t) => s + t.amount, 0)

    const budgetData = budgets.map((b) => ({
      name: b.category,
      planned: b.amount,
      actual: b.spent,
    }))

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      budgets: budgetData,
      activeBudgets: budgets.length,
    })
  } catch (error) {
    console.error("Budget API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
