import prisma from "./prisma"
import { PeerComparison } from "@/types/analytics"

export async function compareToPeers(userId: string): Promise<PeerComparison[]> {
  // In a production app, we would aggregate data from all users in the same bucket
  // For the hackathon, we use realistic benchmarks based on Turkish economic data
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      transactions: true,
      investments: true,
      debts: true
    }
  })

  if (!user) return []

  const currentIncome = user.monthlyIncome || 30000
  const totalInvested = user.investments.reduce((sum, i) => sum + i.currentValue, 0)
  const totalDebt = user.debts.reduce((sum, d) => sum + d.remainingAmount, 0)
  
  const savingsRate = currentIncome > 0 ? (totalInvested / (currentIncome * 12)) * 100 : 0
  const debtRatio = currentIncome > 0 ? (totalDebt / (currentIncome * 12)) * 100 : 0

  return [
    {
      metric: "Tasarruf Oranı",
      userValue: Math.round(savingsRate),
      peerAverage: 15,
      percentile: savingsRate > 20 ? 85 : savingsRate > 10 ? 60 : 30,
      benchmark: savingsRate > 20 ? "En üst %15'lik dilimdesiniz" : "Ortalama seviyedesiniz"
    },
    {
      metric: "Borç/Gelir Oranı",
      userValue: Math.round(debtRatio),
      peerAverage: 40,
      percentile: debtRatio < 20 ? 90 : debtRatio < 40 ? 70 : 40,
      benchmark: debtRatio < 20 ? "Mükemmel borç yönetimi" : "Dikkatli olunmalı"
    },
    {
      metric: "Yatırım Çeşitliliği",
      userValue: user.investments.length,
      peerAverage: 2,
      percentile: user.investments.length >= 4 ? 80 : user.investments.length >= 2 ? 50 : 20,
      benchmark: user.investments.length >= 4 ? "Geniş portföy yelpazesi" : "Daha fazla çeşitlendirme yapılabilir"
    }
  ]
}
