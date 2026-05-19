import prisma from "./prisma"
import { RiskProfile } from "@prisma/client"

export interface AllocationRecommendation {
  stocks: number
  bonds: number
  crypto: number
  gold: number
  cash: number
  explanation: string
}

export async function recommendInvestments(userId: string): Promise<AllocationRecommendation> {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  const profile = user?.riskProfile || "MODERATE"

  switch (profile) {
    case "CONSERVATIVE":
      return {
        stocks: 20, bonds: 50, crypto: 0, gold: 20, cash: 10,
        explanation: "Sermayenizi korumaya odaklı, düşük riskli ve düzenli getiri hedefleyen bir dağılım."
      }
    case "MODERATE":
      return {
        stocks: 50, bonds: 25, crypto: 5, gold: 15, cash: 5,
        explanation: "Risk ve getiri arasında denge kuran, büyüme potansiyeli olan dengeli bir dağılım."
      }
    case "AGGRESSIVE":
      return {
        stocks: 70, bonds: 10, crypto: 15, gold: 5, cash: 0,
        explanation: "Yüksek getiri hedefleyen, volatiliteye dayanıklı ve uzun vadeli büyüme odaklı dağılım."
      }
    case "VERY_AGGRESSIVE":
      return {
        stocks: 60, bonds: 0, crypto: 30, gold: 5, cash: 5,
        explanation: "Maksimum getiri için yüksek riskli varlıklara (kripto, teknoloji hisseleri) odaklanan dağılım."
      }
    default:
      return {
        stocks: 40, bonds: 40, crypto: 0, gold: 10, cash: 10,
        explanation: "Genel piyasa standartlarına uygun, güvenli liman varlıkları içeren temel dağılım."
      }
  }
}
