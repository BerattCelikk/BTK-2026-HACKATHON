import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { GoogleGenerativeAI } from "@google/generative-ai"
import prisma from "@/lib/prisma"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { AgentChat } from "@/components/agents/AgentChat"
import { FinancialAnalystAgent } from "@/agents/financial-analyst/agent"
import { DashboardClient } from "@/components/dashboard/DashboardClient"
import type { AnomalyResult } from "@/types"
import { Wallet, TrendingUp, PiggyBank, ArrowDownRight } from "lucide-react"

async function getDashboardData(userId: string) {
  try {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const firstOfMonth = new Date(currentYear, currentMonth, 1)
  const firstOfLastMonth = new Date(currentYear, currentMonth - 1, 1)
  const firstOfNextMonth = new Date(currentYear, currentMonth + 1, 1)

  const [currentTransactions, lastTransactions, allTransactions, budgets, goals, investments, debts] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: firstOfMonth, lt: firstOfNextMonth } },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: firstOfLastMonth, lt: firstOfMonth } },
    }),
    prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" }
    }),
    prisma.budget.findMany({
      where: { userId, month: currentMonth + 1, year: currentYear },
    }),
    prisma.financialGoal.findMany({
      where: { userId, status: "ACTIVE" },
    }),
    prisma.investment.findMany({ where: { userId } }),
    prisma.debt.findMany({ where: { userId } }),
  ])

  const currentIncome = currentTransactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
  const currentExpenses = currentTransactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
  const currentSavings = currentIncome - currentExpenses

  const lastIncome = lastTransactions.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
  const lastExpenses = lastTransactions.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
  const lastSavings = lastIncome - lastExpenses

  const totalInvestments = investments.reduce((s, i) => s + i.currentValue, 0)

  const calcChange = (curr: number, prev: number) => (prev > 0 ? ((curr - prev) / prev) * 100 : curr > 0 ? 100 : 0)

  const expenseByCategory = currentTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce(
      (acc, t) => {
        const key = t.category
        if (!acc[key]) acc[key] = 0
        acc[key] += t.amount
        return acc
      },
      {} as Record<string, number>
    )

  const totalExpenseAmount = Object.values(expenseByCategory).reduce((s, v) => s + v, 0)
  const expenseBreakdown = Object.entries(expenseByCategory).map(([name, amount]) => ({
    name,
    amount,
    percentage: totalExpenseAmount > 0 ? (amount / totalExpenseAmount) * 100 : 0,
  }))

  const budgetData = budgets.map((b) => ({
    name: b.category,
    planned: b.amount,
    actual: b.spent,
  }))

  const savingsRate = currentIncome > 0 ? (currentSavings / currentIncome) * 100 : 0

  let savingsScore = 0
  if (savingsRate > 20) savingsScore = 40
  else if (savingsRate > 10) savingsScore = 25
  else if (savingsRate > 0) savingsScore = 10

  const debtCount = debts.length
  let debtScore = 0
  if (debtCount === 0) debtScore = 30
  else if (debts.some((d) => d.strategy)) debtScore = 20
  else debtScore = 10

  let budgetScore = 0
  if (budgets.length > 0 && budgets.every((b) => b.spent <= b.amount)) budgetScore = 30
  else if (budgets.length > 0) budgetScore = 15
  else budgetScore = 10

  const healthScore = savingsScore + debtScore + budgetScore

  const badges = [
    {
      id: "savings",
      name: "Tasarruf Ustası",
      description: "Gelirin %20'sinden fazlasını biriktiriyor",
      icon: "PiggyBank",
      unlocked: savingsRate > 20,
    },
    {
      id: "debt",
      name: "Borç Yokedici",
      description: "Borçlarını stratejik yönetiyor",
      icon: "Shield",
      unlocked: debtCount > 0 && debts.some((d) => d.strategy),
    },
    {
      id: "budget",
      name: "Bütçe Kahramanı",
      description: "Bütçesine sadık kalıyor",
      icon: "Award",
      unlocked: budgets.length > 0 && budgets.every((b) => b.spent <= b.amount),
    },
    {
      id: "investor",
      name: "Yatırımcı",
      description: "Aktif yatırım portföyü var",
      icon: "TrendingUp",
      unlocked: investments.length > 0,
    },
    {
      id: "analyst",
      name: "Analist",
      description: "Finansal hedefler belirlemiş",
      icon: "Target",
      unlocked: goals.length > 0,
    },
  ]

  return {
    currentIncome,
    currentExpenses,
    currentSavings,
    lastIncome,
    lastExpenses,
    lastSavings,
    totalInvestments,
    incomeChange: calcChange(currentIncome, lastIncome),
    expenseChange: calcChange(currentExpenses, lastExpenses),
    savingsChange: calcChange(currentSavings, lastSavings),
    expenseBreakdown,
    budgetData,
    activeBudgets: budgets.length,
    activeGoals: goals.length,
    healthScore,
    badges,
    savingsRate,
    transactions: allTransactions.map(t => ({
      ...t,
      date: t.date.toISOString()
    }))
  }
  } catch (error) {
    console.error("Dashboard data fetch error:", error)
    return {
      currentIncome: 0,
      currentExpenses: 0,
      currentSavings: 0,
      lastIncome: 0,
      lastExpenses: 0,
      lastSavings: 0,
      totalInvestments: 0,
      incomeChange: 0,
      expenseChange: 0,
      savingsChange: 0,
      expenseBreakdown: [],
      budgetData: [],
      activeBudgets: 0,
      activeGoals: 0,
      healthScore: 10,
      badges: [],
      savingsRate: 0,
      transactions: []
    }
  }
}

async function generateBriefing(
  data: Awaited<ReturnType<typeof getDashboardData>>,
  firstName: string
): Promise<string> {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("No API key")
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const result = await model.generateContent(
      `Kullanıcının finansal durumuna göre 2 cümlelik kişiselleştirilmiş günlük finans özeti yaz.
Kullanıcı adı: ${firstName}
Bu ayki gelir: ${data.currentIncome} TL
Bu ayki gider: ${data.currentExpenses} TL
Tasarruf oranı: %${data.savingsRate.toFixed(1)}
Geçen aya göre gelir değişimi: %${data.incomeChange.toFixed(1)}
Geçen aya göre gider değişimi: %${data.expenseChange.toFixed(1)}
Aktif bütçe sayısı: ${data.activeBudgets}

ÖNEMLİ: Sadece 2 cümle, samimi ve motive edici, Türkçe. "Günaydın ${firstName}!" ile başla. Kişiye özel tavsiye içersin.`
    )

    return result.response.text().replace(/^["']|["']$/g, "")
  } catch {
    return `Günaydın ${firstName}! Finansal durumunuzu incelemek için AI asistanımızla konuşun.`
  }
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect("/login")

  const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } })
  if (!dbUser) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20">
          <CardContent className="p-12 text-center">
            <p className="text-gray-400 text-lg">Hoş geldiniz! Finansal yolculuğunuza başlamak için lütfen onboardingi tamamlayın.</p>
          </CardContent>
        </Card>
        <AgentChat userId={userId} />
      </div>
    )
  }

  const data = await getDashboardData(dbUser.id)

  const agent = new FinancialAnalystAgent()
  const [anomalies, briefing] = await Promise.all([
    agent.detectAnomalies(dbUser.id).catch(() => [] as AnomalyResult[]),
    generateBriefing(data, dbUser.firstName || "Kullanıcı").catch(() =>
      `Günaydın ${dbUser.firstName || "Kullanıcı"}! Finansal durumunuzu incelemek için AI asistanımızla konuşun.`
    ),
  ])

  const stats = [
    {
      title: "Aylık Gelir",
      value: formatCurrency(data.currentIncome),
      change: formatPercentage(data.incomeChange),
      positive: data.incomeChange >= 0,
      icon: Wallet,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Aylık Gider",
      value: formatCurrency(data.currentExpenses),
      change: formatPercentage(data.expenseChange),
      positive: data.expenseChange <= 0,
      icon: ArrowDownRight,
      color: "from-red-500 to-rose-500",
    },
    {
      title: "Net Tasarruf",
      value: formatCurrency(data.currentSavings),
      change: formatPercentage(data.savingsChange),
      positive: data.savingsChange >= 0,
      icon: PiggyBank,
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Yatırımlar",
      value: formatCurrency(data.totalInvestments),
      change: `${data.activeGoals} hedef`,
      positive: true,
      icon: TrendingUp,
      color: "from-purple-500 to-pink-500",
    },
  ]

  return (
    <DashboardClient 
      userId={dbUser.id}
      firstName={dbUser.firstName || "Kullanıcı"}
      data={data}
      stats={stats}
      anomalies={anomalies}
      briefing={briefing}
      transactions={data.transactions}
    />
  )
}
