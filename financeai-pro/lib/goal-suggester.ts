import prisma from "./prisma"
import { RiskProfile } from "@prisma/client"

export interface SuggestedGoal {
  title: string
  description: string
  timeframe: string
  monthlySavingsNeeded: number
  priority: "high" | "medium" | "low"
}

export async function suggestFinancialGoals(userId: string): Promise<SuggestedGoal[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { financialGoals: true, debts: true }
  })

  if (!user) return []

  const monthlyIncome = user.monthlyIncome || 0
  const suggestions: SuggestedGoal[] = []

  // 1. Emergency Fund (High Priority if not exists)
  const hasEmergencyFund = user.financialGoals.some(g => g.title.toLowerCase().includes("acil durum"))
  if (!hasEmergencyFund && monthlyIncome > 0) {
    suggestions.push({
      title: "Acil Durum Fonu Oluştur",
      description: "Beklenmedik masraflar için 6 aylık giderinizi karşılayacak bir fon oluşturun.",
      timeframe: "12 Ay",
      monthlySavingsNeeded: monthlyIncome * 0.1,
      priority: "high"
    })
  }

  // 2. Debt Payoff (High Priority if high interest debt exists)
  const hasSignificantDebt = user.debts.length > 0
  if (hasSignificantDebt) {
    suggestions.push({
      title: "Borç Kapatma Stratejisi",
      description: "Yüksek faizli borçlarınızı temizleyerek finansal özgürlüğe ilk adımı atın.",
      timeframe: "6-12 Ay",
      monthlySavingsNeeded: monthlyIncome * 0.15,
      priority: "high"
    })
  }

  // 3. Investment Goal (Medium/High based on profile)
  const totalInvested = await prisma.investment.aggregate({
    where: { userId },
    _sum: { currentValue: true }
  })

  if ((totalInvested._sum.currentValue || 0) < monthlyIncome * 5) {
    suggestions.push({
      title: "Yatırım Portföyünü Büyüt",
      description: "Geleceğiniz için düzenli yatırım yapmaya başlayın ve bileşik getirinin gücünden faydalanın.",
      timeframe: "24 Ay",
      monthlySavingsNeeded: monthlyIncome * 0.2,
      priority: user.riskProfile === "AGGRESSIVE" ? "high" : "medium"
    })
  }

  return suggestions
}
