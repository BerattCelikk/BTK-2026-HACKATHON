import prisma from "./prisma"
import { PortfolioAnalysis } from "@/types/analytics"

export async function analyzePortfolio(userId: string): Promise<PortfolioAnalysis> {
  const assets = await prisma.portfolioAsset.findMany({
    where: { userId }
  })

  if (assets.length === 0) {
    return {
      totalWealth: 0,
      composition: { stocks: 0, bonds: 0, crypto: 0, cash: 0, gold: 0 },
      concentration: "low",
      riskAssessment: "Portföyünüzde henüz kayıtlı varlık bulunmamaktadır.",
      recommendations: ["İlk varlık kaydınızı yaparak portföy analizinizi başlatın."],
      rebalanceActions: []
    }
  }

  const totalWealth = assets.reduce((sum, a) => sum + Number(a.amount) * Number(a.currentPrice), 0)
  
  const composition = {
    stocks: 0,
    bonds: 0,
    crypto: 0,
    cash: 0,
    gold: 0
  }

  assets.forEach(a => {
    const type = a.assetType as keyof typeof composition
    if (composition.hasOwnProperty(type)) {
      const value = Number(a.amount) * Number(a.currentPrice)
      composition[type] = (value / totalWealth) * 100
    }
  })

  // Concentration Check
  const maxShare = Math.max(...Object.values(composition))
  let concentration: "low" | "medium" | "high" = "low"
  if (maxShare > 50) concentration = "high"
  else if (maxShare > 30) concentration = "medium"

  const recommendations: string[] = []
  if (concentration === "high") {
    recommendations.push("Portföyünüz tek bir varlık türünde yoğunlaşmış durumda. Çeşitlendirme yaparak riski dağıtın.")
  }

  // Basic Rebalancing Logic (Target 60/30/10 for Stocks/Bonds/Cash)
  const targets = { stocks: 60, bonds: 30, cash: 10, crypto: 0, gold: 0 }
  const rebalanceActions: any[] = []

  Object.entries(targets).forEach(([asset, target]) => {
    const current = composition[asset as keyof typeof composition] || 0
    if (Math.abs(current - target) > 5) {
      rebalanceActions.push({
        asset,
        currentPercent: Math.round(current),
        targetPercent: target,
        action: current < target ? "buy" : "sell"
      })
    }
  })

  return {
    totalWealth,
    composition,
    concentration,
    riskAssessment: concentration === "high" ? "Yüksek Risk: Varlık yoğunlaşması fazla." : "Düşük/Orta Risk: Dengeli portföy.",
    recommendations,
    rebalanceActions
  }
}
