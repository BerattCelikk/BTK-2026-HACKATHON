import prisma from "./prisma"
import { analyzePortfolio } from "./portfolio-analyzer"
import { recommendInvestments } from "./investment-recommender"

export interface RebalancingAlert {
  id: string
  alert: string
  action: string
  urgency: "low" | "medium" | "high"
}

export async function checkRebalancingNeeded(userId: string): Promise<RebalancingAlert[]> {
  const [portfolio, targets] = await Promise.all([
    analyzePortfolio(userId),
    recommendInvestments(userId)
  ])

  if (portfolio.totalWealth === 0) return []

  const alerts: RebalancingAlert[] = []

  const targetMapping: Record<string, number> = {
    stocks: targets.stocks,
    bonds: targets.bonds,
    crypto: targets.crypto,
    gold: targets.gold,
    cash: targets.cash
  }

  Object.entries(portfolio.composition).forEach(([asset, current]) => {
    const target = targetMapping[asset] || 0
    const diff = Math.abs(current - target)

    if (diff > 10) {
      alerts.push({
        id: `rebalance-${asset}`,
        alert: `${asset.toUpperCase()} ağırlığı hedefinizden %${Math.round(diff)} sapmış durumda.`,
        action: current > target ? "Bir miktar satış yaparak kâr realize edin." : "Hedef ağırlığa ulaşmak için alım yapın.",
        urgency: diff > 20 ? "high" : "medium"
      })
    }
  })

  return alerts
}
