import prisma from "./prisma"
import { AnomalyResult, AnomalyType } from "@/types"

export class AnomalyDetector {
  async detectSpendingSpike(userId: string): Promise<AnomalyResult | null> {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    // Get transactions for the current month
    const currentMonthTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: {
          gte: new Date(currentYear, now.getMonth(), 1),
          lt: new Date(currentYear, now.getMonth() + 1, 1),
        },
      },
    })

    const currentTotal = currentMonthTransactions.reduce((sum, t) => sum + t.amount, 0)

    // Get transactions for the previous 2 months
    const twoMonthsAgo = new Date(currentYear, now.getMonth() - 2, 1)
    const prevMonthEnd = new Date(currentYear, now.getMonth(), 1)

    const prevTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        date: {
          gte: twoMonthsAgo,
          lt: prevMonthEnd,
        },
      },
    })

    // Group by month to calculate averages
    const monthlyTotals: Record<string, number> = {}
    prevTransactions.forEach(t => {
      const key = `${t.date.getFullYear()}-${t.date.getMonth()}`
      monthlyTotals[key] = (monthlyTotals[key] || 0) + t.amount
    })

    const months = Object.values(monthlyTotals)
    if (months.length === 0) return null

    const avgPrev = months.reduce((sum, val) => sum + val, 0) / months.length
    
    if (avgPrev > 0 && currentTotal > avgPrev * 1.3) {
      const ratio = currentTotal / avgPrev
      let severity = 3
      if (ratio > 3) severity = 10
      else if (ratio > 2) severity = 7
      else if (ratio > 1.5) severity = 5

      return {
        type: "spending_spike",
        severity,
        message: `Bu ayki harcamalarınız önceki ayların ortalamasına göre %${Math.round((ratio - 1) * 100)} daha fazla.`,
        transactionId: null,
        context: {
          currentTotal,
          avgPrev,
          ratio
        }
      }
    }

    return null
  }

  async detectCategoryAnomaly(userId: string): Promise<AnomalyResult | null> {
    const latestTransaction = await prisma.transaction.findFirst({
      where: { userId, type: "EXPENSE" },
      orderBy: { date: "desc" }
    })

    if (!latestTransaction) return null

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const categoryTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        category: latestTransaction.category,
        type: "EXPENSE",
        date: {
          gte: thirtyDaysAgo,
          lt: latestTransaction.date
        }
      }
    })

    if (categoryTransactions.length < 3) return null

    const avgAmount = categoryTransactions.reduce((sum, t) => sum + t.amount, 0) / categoryTransactions.length

    if (latestTransaction.amount > avgAmount * 2) {
      const ratio = latestTransaction.amount / avgAmount
      let severity = 4
      if (ratio > 10) severity = 10
      else if (ratio > 5) severity = 8
      else if (ratio > 3) severity = 6

      return {
        type: "category_anomaly",
        severity,
        message: `${latestTransaction.category} kategorisindeki son harcamanız (${latestTransaction.amount} TL), son 30 günlük ortalamanızın (${Math.round(avgAmount)} TL) çok üzerinde.`,
        transactionId: latestTransaction.id,
        context: {
          amount: latestTransaction.amount,
          avgAmount,
          category: latestTransaction.category
        }
      }
    }

    return null
  }

  async detectBudgetBreach(userId: string): Promise<AnomalyResult | null> {
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month: currentMonth,
        year: currentYear
      }
    })

    for (const budget of budgets) {
      if (budget.spent > budget.amount) {
        const ratio = budget.spent / budget.amount
        let severity = 2
        if (ratio > 2) severity = 10
        else if (ratio > 1.5) severity = 8
        else if (ratio > 1.2) severity = 6
        else if (ratio > 1.1) severity = 4

        return {
          type: "budget_breach",
          severity,
          message: `${budget.category} kategorisi için ayırdığınız bütçeyi %${Math.round((ratio - 1) * 100)} aştınız.`,
          transactionId: null,
          context: {
            category: budget.category,
            limit: budget.amount,
            spent: budget.spent,
            ratio
          }
        }
      }
    }

    return null
  }

  async detectAll(userId: string): Promise<AnomalyResult[]> {
    const results = await Promise.all([
      this.detectSpendingSpike(userId),
      this.detectCategoryAnomaly(userId),
      this.detectBudgetBreach(userId)
    ])

    return results
      .filter((r): r is AnomalyResult => r !== null)
      .sort((a, b) => b.severity - a.severity)
  }
}

export const anomalyDetector = new AnomalyDetector()
