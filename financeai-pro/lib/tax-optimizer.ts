import prisma from "./prisma"
import { TaxStrategy } from "@/types/analytics"

export async function suggestTaxStrategies(userId: string, annualIncome: number): Promise<TaxStrategy[]> {
  const strategies: TaxStrategy[] = []

  // 1. Long-term hold benefits (Turkey specific: >1 year hold reduction)
  strategies.push({
    strategy: "Uzun Vadeli Yatırım Avantajı",
    savingsPotential: annualIncome * 0.05, // Rough estimate
    riskLevel: "low",
    description: "Türkiye'de 1 yıldan uzun süre tutulan bazı yatırım araçlarında (Eurobond hariç) vergi avantajları mevcuttur. Varlıklarınızı uzun vadeli tutarak sermaye kazancı vergisinden tasarruf edebilirsiniz.",
    estimatedTaxSavings: annualIncome * 0.02
  })

  // 2. Individual Pension System (BES)
  strategies.push({
    strategy: "Bireysel Emeklilik Sistemi (BES)",
    savingsPotential: 20000, // Fixed state contribution cap simulation
    riskLevel: "low",
    description: "BES ödemeleriniz için %30 devlet katkısı alarak doğrudan vergi avantajı ve ek birikim sağlayabilirsiniz.",
    estimatedTaxSavings: 15000
  })

  // 3. Tax-loss harvesting simulation
  const losses = await prisma.investment.findMany({
    where: { 
      userId,
      currentValue: { lt: prisma.investment.fields.amount } // Simplified loss check
    }
  })

  if (losses.length > 0) {
    strategies.push({
      strategy: "Vergi Kaybı Hasadı (Tax-Loss Harvesting)",
      savingsPotential: losses.reduce((sum, i) => sum + (i.amount - i.currentValue), 0) * 0.15,
      riskLevel: "medium",
      description: "Zararda olan pozisyonlarınızı yıl sonundan önce kapatarak, karda olduğunuz işlemlerden doğacak vergi yükümlülüğünüzü azaltabilirsiniz.",
      estimatedTaxSavings: 5000
    })
  }

  return strategies
}
