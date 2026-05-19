import prisma from "./prisma"
import { subDays } from "date-fns"

export interface SpendingOptimization {
  id: string
  title: string
  description: string
  monthlySavings: number
  yearlySavings: number
  impact: "high" | "medium" | "low"
}

export async function optimizeSpending(userId: string): Promise<SpendingOptimization[]> {
  const thirtyDaysAgo = subDays(new Date(), 30)
  
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: "EXPENSE",
      date: { gte: thirtyDaysAgo }
    }
  })

  if (transactions.length === 0) return []

  const optimizations: SpendingOptimization[] = []

  // 1. Dining/Eating Out Analysis
  const diningTotal = transactions
    .filter(t => ["DINING", "GROCERIES"].includes(t.category))
    .reduce((sum, t) => sum + t.amount, 0)

  if (diningTotal > 5000) {
    optimizations.push({
      id: "optimize-dining",
      title: "Dışarıda Yemek Harcamalarını Azaltın",
      description: "Haftada sadece 2 gün evde yemek pişirerek önemli bir tasarruf sağlayabilirsiniz.",
      monthlySavings: diningTotal * 0.2,
      yearlySavings: diningTotal * 0.2 * 12,
      impact: "high"
    })
  }

  // 2. Subscription Check (Frequent small amounts in same category)
  const otherTotal = transactions
    .filter(t => t.category === "OTHER" || t.category === "ENTERTAINMENT")
    .reduce((sum, t) => sum + t.amount, 0)
  
  if (otherTotal > 1000) {
    optimizations.push({
      id: "optimize-subs",
      title: "Aboneliklerinizi Gözden Geçirin",
      description: "Kullanmadığınız dijital servisleri iptal ederek bütçenizde yer açın.",
      monthlySavings: 300,
      yearlySavings: 3600,
      impact: "medium"
    })
  }

  // 3. Transportation (if high)
  const transportTotal = transactions
    .filter(t => t.category === "TRANSPORTATION")
    .reduce((sum, t) => sum + t.amount, 0)

  if (transportTotal > 3000) {
    optimizations.push({
      id: "optimize-transport",
      title: "Ulaşım Maliyetini Optimize Edin",
      description: "Toplu taşıma kullanımını artırarak veya yakıt tasarrufu yaparak giderlerinizi düşürebilirsiniz.",
      monthlySavings: transportTotal * 0.15,
      yearlySavings: transportTotal * 0.15 * 12,
      impact: "medium"
    })
  }

  return optimizations
}
