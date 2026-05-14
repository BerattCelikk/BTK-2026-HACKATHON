import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { GoogleGenerativeAI } from "@google/generative-ai"
import prisma from "@/lib/prisma"
import { formatCurrency, formatPercentage } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AgentChat } from "@/components/agents/AgentChat"
import { StatsCards } from "@/components/dashboard/StatsCards"
import { ExportReportButton } from "@/components/dashboard/ExportReportButton"
import { HealthScoreGauge } from "@/components/dashboard/HealthScoreGauge"
import { BadgesSection } from "@/components/dashboard/BadgesSection"
import { ExpenseChart } from "@/components/charts"
import { FinancialAnalystAgent } from "@/agents/financial-analyst/agent"
import type { AnomalyResult } from "@/types"
import { Wallet, TrendingUp, PiggyBank, ArrowDownRight, Bot, Heart, Award, AlertTriangle, Sparkles } from "lucide-react"

async function getDashboardData(userId: string) {
  try {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  const firstOfMonth = new Date(currentYear, currentMonth, 1)
  const firstOfLastMonth = new Date(currentYear, currentMonth - 1, 1)
  const firstOfNextMonth = new Date(currentYear, currentMonth + 1, 1)

  const [currentTransactions, lastTransactions, budgets, goals, investments, debts] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId, date: { gte: firstOfMonth, lt: firstOfNextMonth } },
    }),
    prisma.transaction.findMany({
      where: { userId, date: { gte: firstOfLastMonth, lt: firstOfMonth } },
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

  const formatDateTR = () =>
    new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(new Date())

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <div className="mt-2 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 p-4 shadow-lg shadow-emerald-500/5">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
              <p className="text-sm text-gray-200 leading-relaxed">{briefing}</p>
            </div>
          </div>
        </div>
        <ExportReportButton />
      </div>

      {/* Print-only report header */}
      <div className="print-report-header print-show hidden">
        <div className="print-report-logo">
          <div className="logo-icon">F</div>
          <div>
            <div className="logo-text">FinanceAI</div>
            <div className="logo-badge">Pro</div>
          </div>
        </div>
        <div className="text-right">
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#111827", margin: 0 }}>
            Finansal Rapor
          </h1>
          <div className="print-date">{formatDateTR()}</div>
        </div>
      </div>

      {/* Print summary cards */}
      <div className="print-show hidden">
        <div className="print-summary-grid">
          <div className="print-summary-item">
            <div className="label">Aylık Gelir</div>
            <div className="value print-green">{formatCurrency(data.currentIncome)}</div>
          </div>
          <div className="print-summary-item">
            <div className="label">Aylık Gider</div>
            <div className="value print-red">{formatCurrency(data.currentExpenses)}</div>
          </div>
          <div className="print-summary-item">
            <div className="label">Net Tasarruf</div>
            <div className="value print-green">{formatCurrency(data.currentSavings)}</div>
          </div>
          <div className="print-summary-item">
            <div className="label">Toplam Yatırım</div>
            <div className="value">{formatCurrency(data.totalInvestments)}</div>
          </div>
        </div>

        {data.expenseBreakdown.length > 0 && (
          <>
            <div className="print-section-title">Harcama Dağılımı</div>
            <table className="print-table">
              <thead>
                <tr>
                  <th>Kategori</th>
                  <th>Tutar</th>
                  <th>Oran</th>
                </tr>
              </thead>
              <tbody>
                {data.expenseBreakdown.map((e) => (
                  <tr key={e.name}>
                    <td>{e.name}</td>
                    <td>{formatCurrency(e.amount)}</td>
                    <td>%{e.percentage.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <div className="print-report-footer">
          <span>FinanceAI Pro - Akıllı Finansal Yönetim</span>
          <span>Rapor tarihi: {formatDateTR()}</span>
        </div>
      </div>

      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AgentChat userId={userId} />

          {data.expenseBreakdown.length > 0 && (
            <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Harcama Dağılımı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <ExpenseChart data={data.expenseBreakdown} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Heart className="h-5 w-5 text-emerald-400" />
                Finansal Sağlık
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-4">
              <HealthScoreGauge score={data.healthScore} />
              {data.savingsRate > 0 && (
                <p className="text-xs text-gray-500 mt-3">
                  Birikim oranı: %{data.savingsRate.toFixed(1)}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Award className="h-5 w-5 text-emerald-400" />
                Rozetler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BadgesSection badges={data.badges} />
            </CardContent>
          </Card>

          {anomalies.length > 0 && (
            <Card className="border-amber-500/50 bg-amber-950/20 backdrop-blur-md shadow-lg shadow-amber-500/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-400">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  Anomali Tespit Edildi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {anomalies.map((a, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-3 ${
                      a.severity === "high"
                        ? "border-red-500/30 bg-red-500/10"
                        : a.severity === "medium"
                          ? "border-amber-500/30 bg-amber-500/10"
                          : "border-yellow-500/20 bg-yellow-500/5"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${
                        a.severity === "high" ? "text-red-400" : "text-amber-400"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200">{a.description}</p>
                        <p className="text-xs text-gray-400 mt-1">{a.suggestion}</p>
                        <div className="flex gap-2 mt-1.5">
                          <span className="text-[10px] uppercase tracking-wider font-medium text-gray-500">
                            {a.category} • {a.amount.toLocaleString("tr-TR")} TL
                          </span>
                          <span className={`text-[10px] uppercase tracking-wider font-medium ${
                            a.severity === "high" ? "text-red-400" : "text-amber-400"
                          }`}>
                            {a.severity === "high" ? "Yüksek" : a.severity === "medium" ? "Orta" : "Düşük"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <CardHeader>
              <CardTitle className="text-lg text-white">Hızlı İpuçları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "Gelirinizin en az %20'sini tasarrufa ayırın",
                "Acil durum fonunuzu 3-6 aylık gider kadar oluşturun",
                "Yatırımlarınızı çeşitlendirerek riski dağıtın",
                "Kredi kartı borcunuzu her ay tamamen ödeyin",
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="h-2 w-2 mt-2 rounded-full bg-emerald-500 shrink-0" />
                  <p className="text-sm text-gray-400">{tip}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <CardHeader>
              <CardTitle className="text-lg text-white">AI Ajanlar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { name: "Finansal Analist", badge: "Analiz", color: "bg-blue-500/10 text-blue-400" },
                { name: "Yatırım Danışmanı", badge: "Yatırım", color: "bg-purple-500/10 text-purple-400" },
                { name: "Bütçe Uzmanı", badge: "Bütçe", color: "bg-emerald-500/10 text-emerald-400" },
                { name: "Eğitim Asistanı", badge: "Eğitim", color: "bg-yellow-500/10 text-yellow-400" },
                { name: "Borç Yöneticisi", badge: "Borç", color: "bg-red-500/10 text-red-400" },
              ].map((agent) => (
                <div key={agent.name} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2">
                  <span className="text-sm text-gray-300">{agent.name}</span>
                  <Badge className={`${agent.color} border-0`}>{agent.badge}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
