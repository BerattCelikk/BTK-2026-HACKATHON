import { GoogleGenerativeAI } from "@google/generative-ai"
import { RiskProfile } from "@/types"
import { generateRAGContext } from "@/lib/rag-query"

export class InvestmentAdvisorAgent {
  private genAI: GoogleGenerativeAI

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  async generatePortfolio(input: {
    riskProfile: "conservative" | "moderate" | "aggressive" | "very_aggressive"
    amount: number
    horizon: number
  }): Promise<any> {
    const ragContext = await generateRAGContext("yatırım stratejileri ve risk yönetimi")
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const prompt = `
${ragContext}

Uzman bir yatırım danışmanı olarak, ${input.amount.toLocaleString("tr-TR")} TL'i ${input.horizon} yıl için nasıl yatırması gerektiğini öner.

RİSK PROFİLİ: ${this.translateRiskProfile(input.riskProfile)}

YÖNERGE:
- Türkiye ekonomisinin durumunu düşün
- Yatırımcının risk toleransına uygun dağılım yap
- Spesifik varlık türlerine atıf yap

PORTFÖY DAĞILIMI (yüzdeler):
- Hisse Senedi: %X
- Tahvil: %X
- Nakit/PPF: %X
- Kripto Para: %X

BEKLENTİLER:
- Yıllık beklenen getiri: %X
- Risk seviyesi: Düşük/Orta/Yüksek

AÇIKLAMA:
Neden bu kombinasyon? Türkçe, uzman ama anlaşılır dilde.

Sadece JSON yanıtı ver:
{
  "allocation": { "stocks": 0.40, "bonds": 0.30, "cash": 0.20, "crypto": 0.10 },
  "expectedReturn": 0.12,
  "riskLevel": "moderate",
  "rationale": "Türkçe açıklama"
}
`
    const result = await model.generateContent(prompt)
    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return this.getDefaultAllocation(input.riskProfile)
    }
    try {
      return JSON.parse(jsonMatch[0])
    } catch {
      return this.getDefaultAllocation(input.riskProfile)
    }
  }

  private getDefaultAllocation(riskProfile: string): any {
    const profiles: Record<string, any> = {
      conservative: { allocation: { stocks: 0.10, bonds: 0.50, cash: 0.35, crypto: 0.05 }, expectedReturn: 0.06, riskLevel: "düşük" },
      moderate: { allocation: { stocks: 0.40, bonds: 0.30, cash: 0.20, crypto: 0.10 }, expectedReturn: 0.12, riskLevel: "orta" },
      aggressive: { allocation: { stocks: 0.60, bonds: 0.15, cash: 0.05, crypto: 0.20 }, expectedReturn: 0.18, riskLevel: "yüksek" },
      very_aggressive: { allocation: { stocks: 0.70, bonds: 0.05, cash: 0.05, crypto: 0.20 }, expectedReturn: 0.22, riskLevel: "çok yüksek" },
    }
    return { ...profiles[riskProfile] || profiles.moderate, rationale: "Risk profilinize göre dengelenmiş portföy dağılımı." }
  }

  private translateRiskProfile(profile: string): string {
    const map: Record<string, string> = {
      conservative: "Muhafazakâr (düşük risk, sabit getiri)",
      moderate: "Dengeli (orta risk, makul getiri)",
      aggressive: "Agresif (yüksek risk, yüksek getiri)",
      very_aggressive: "Çok Agresif (çok yüksek risk)",
    }
    return map[profile] || profile
  }

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

  simulatePortfolio(initialInvestment: number, monthlyContribution: number, riskProfile: RiskProfile, timeHorizon: number) {
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
    return { initialInvestment, monthlyContribution, riskProfile, timeHorizon, projectedValues, assetAllocation: currentAllocation }
  }

  async generateInvestmentAdvice(data: { riskProfile: RiskProfile; amount: number; timeHorizon: number; goals: string[] }, simulation?: any): Promise<string> {
    const profileLabels: Record<RiskProfile, string> = {
      conservative: "Düşük Risk (Muhafazakâr)",
      moderate: "Orta Risk (Dengeli)",
      aggressive: "Yüksek Risk (Agresif)",
      very_aggressive: "Çok Yüksek Risk",
    }
    const allocation = this.getAssetAllocation(data.riskProfile)
    return [
      "**📊 YATIRIM DANIŞMANLIĞI RAPORU**",
      "",
      `**Risk Profiliniz:** ${profileLabels[data.riskProfile]}`,
      "",
      "**Önerilen Portföy Dağılımı:**",
      ...allocation.map((a) => `- ${a.name}: %${a.percentage}`),
      "",
      "**Yatırım Stratejisi:**",
      "- Düzenli aralıklarla alım yapın (Dolar Maliyeti Ortalaması)",
      "- Portföyünüzü yılda en az bir kez yeniden dengeleyin",
      "- Kısa vadeli dalgalanmalara takılmadan uzun vadeli düşünün",
      "",
      `**Başlangıç:** ${data.amount.toLocaleString("tr-TR")} TL`,
      `**Vade:** ${data.timeHorizon} year`,
      "",
      "**⚠️ Uyarılar:**",
      "- Yatırımlarınızın değeri düşebilir",
      "- Geçmiş performans gelecekteki getiriler için garanti değildir",
      "- Risk toleransınızı aşan yatırımlardan kaçının",
      "- Acil durum fonunuzu yatırım yapmadan önce oluşturun",
    ].join("\n")
  }
}
