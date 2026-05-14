import { RiskProfile } from "@/types"

export class InvestmentAdvisorAgent {
  getAssetAllocation(riskProfile: RiskProfile): { name: string; percentage: number }[] {
    const allocations: Record<RiskProfile, { name: string; percentage: number }[]> = {
      conservative: [
        { name: "Nakit/PPF", percentage: 40 },
        { name: "Devlet Tahvili", percentage: 30 },
        { name: "Altın", percentage: 20 },
        { name: "Hisse Senedi", percentage: 10 },
      ],
      moderate: [
        { name: "Hisse Senedi", percentage: 35 },
        { name: "Devlet Tahvili", percentage: 20 },
        { name: "Altın", percentage: 15 },
        { name: "Nakit/PPF", percentage: 15 },
        { name: "Döviz", percentage: 10 },
        { name: "Kripto Para", percentage: 5 },
      ],
      aggressive: [
        { name: "Hisse Senedi", percentage: 55 },
        { name: "Kripto Para", percentage: 15 },
        { name: "Altın", percentage: 10 },
        { name: "Devlet Tahvili", percentage: 10 },
        { name: "Nakit/PPF", percentage: 5 },
        { name: "Girişim", percentage: 5 },
      ],
      very_aggressive: [
        { name: "Hisse Senedi", percentage: 60 },
        { name: "Kripto Para", percentage: 25 },
        { name: "Girişim", percentage: 10 },
        { name: "Nakit/PPF", percentage: 5 },
      ],
    }
    return allocations[riskProfile] || allocations.moderate
  }

  simulatePortfolio(
    initialInvestment: number,
    monthlyContribution: number,
    riskProfile: RiskProfile,
    timeHorizon: number
  ) {
    const returns: Record<RiskProfile, number> = {
      conservative: 0.08,
      moderate: 0.14,
      aggressive: 0.20,
      very_aggressive: 0.25,
    }

    const annualReturn = returns[riskProfile] || 0.14
    const monthlyReturn = annualReturn / 12
    const projectedValues = []
    let conservative = initialInvestment
    let moderate = initialInvestment
    let aggressive = initialInvestment

    for (let year = 1; year <= timeHorizon; year++) {
      for (let m = 0; m < 12; m++) {
        conservative = conservative * (1 + 0.06 / 12) + monthlyContribution
        moderate = moderate * (1 + monthlyReturn) + monthlyContribution
        aggressive = aggressive * (1 + 0.25 / 12) + monthlyContribution
      }

      projectedValues.push({
        year,
        conservative: Math.round(conservative),
        moderate: Math.round(moderate),
        aggressive: Math.round(aggressive),
      })
    }

    const allocation = this.getAssetAllocation(riskProfile)
    const currentAllocation = allocation.map((a) => ({
      asset: a.name,
      percentage: a.percentage,
      amount: Math.round(initialInvestment * (a.percentage / 100)),
    }))

    return {
      initialInvestment,
      monthlyContribution,
      riskProfile,
      timeHorizon,
      projectedValues,
      assetAllocation: currentAllocation,
    }
  }

  async generateInvestmentAdvice(
    data: {
      riskProfile: RiskProfile
      amount: number
      timeHorizon: number
      goals: string[]
    },
    simulation?: any
  ): Promise<string> {
    const profileLabels: Record<RiskProfile, string> = {
      conservative: "Düşük",
      moderate: "Orta",
      aggressive: "Yüksek",
      very_aggressive: "Çok Yüksek",
    }
    const allocation = this.getAssetAllocation(data.riskProfile)
    const finalValue =
      simulation?.projectedValues?.[simulation.projectValues?.length - 1]?.moderate ?? 0

    let advice = `**Yatırım Danışmanlığı Raporu**

**Risk Profiliniz:** ${profileLabels[data.riskProfile]}

**Önerilen Portföy Dağılımı:**
${allocation.map((a) => `- ${a.name}: %${a.percentage}`).join("\n")}

**Yatırım Stratejisi:**
- Periyodik olarak düzenli alım yapın (Dolar Maliyeti Ortalaması)
- Portföyünüzü yılda en az bir kez yeniden dengeleyin
- Kısa vadeli dalgalanmalara takılmadan uzun vadeli düşünün
`

    if (data.timeHorizon >= 10) {
      advice += `
**Uzun Vadeli Öngörü:**
${data.amount.toLocaleString("tr-TR")} TL başlangıç ve aylık düzenli katkılarla ${data.timeHorizon} yıl sonunda portföyünüzün değeri önemli ölçüde artabilir.
`
    }

    advice += `
**Uyarılar:**
⚠️ Yatırımlarınızın değeri düşebilir ve geçmiş performans gelecekteki getiriler için garanti değildir.
⚠️ Risk toleransınızı aşan yatırımlardan kaçının.
⚠️ Acil durum fonunuzu yatırım yapmadan önce oluşturun.
`

    return advice
  }
}
