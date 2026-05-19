import prisma from "./prisma"
import { startOfMonth, subMonths, endOfMonth } from "date-fns"

export interface SpendingInsight {
  category: string
  avgSpend: number
  trend: "up" | "down" | "stable"
  insight: string
  percentageChange: number
}

export async function analyzeSpendingPatterns(userId: string): Promise<SpendingInsight[]> {
  const ninetyDaysAgo = subMonths(new Date(), 3)
  
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: ninetyDaysAgo }
    }
  })

  if (transactions.length === 0) return []

  const categories = Array.from(new Set(transactions.map(t => t.category)))
  const insights: SpendingInsight[] = []

  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))

  for (const category of categories) {
    const catTrans = transactions.filter(t => t.category === category)
    const avgSpend = catTrans.reduce((sum, t) => sum + t.amount, 0) / 3

    const thisMonthTotal = catTrans
      .filter(t => t.date >= thisMonthStart)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const lastMonthTotal = catTrans
      .filter(t => t.date >= lastMonthStart && t.date < thisMonthStart)
      .reduce((sum, t) => sum + t.amount, 0)

    let trend: "up" | "down" | "stable" = "stable"
    let percentageChange = 0

    if (lastMonthTotal > 0) {
      percentageChange = ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
      if (percentageChange > 10) trend = "up"
      else if (percentageChange < -10) trend = "down"
    }

    let insight = ""
    if (trend === "up") {
      insight = `${category} harcamalarınız son ay %${Math.round(percentageChange)} arttı. Bu alanda bütçenizi kontrol etmek isteyebilirsiniz.`
    } else if (trend === "down") {
      insight = `${category} harcamalarınızı %${Math.round(Math.abs(percentageChange))} azalttınız. Harika gidiyorsunuz!`
    } else {
      insight = `${category} harcamalarınız dengeli seyrediyor.`
    }

    insights.push({
      category,
      avgSpend: Math.round(avgSpend),
      trend,
      insight,
      percentageChange
    })
  }

  return insights.sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange))
}
