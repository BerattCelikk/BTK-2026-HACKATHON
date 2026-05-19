import { GoogleGenerativeAI } from "@google/generative-ai"
import { PortfolioAnalysis, TaxStrategy, OpportunitySignal } from "@/types/analytics"

export class PortfolioAdvisorAgent {
  private genAI: GoogleGenerativeAI

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  async generateRecommendations(
    portfolio: PortfolioAnalysis,
    taxStrategies: TaxStrategy[],
    opportunities: OpportunitySignal[]
  ): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Profesyonel bir yatırım danışmanı olarak kullanıcının portföyünü ve fırsatları analiz et.

VERİLER:
- Portföy Durumu: %${Math.round(portfolio.composition.stocks)} Hisse, %${Math.round(portfolio.composition.crypto)} Kripto, %${Math.round(portfolio.composition.gold)} Altın, %${Math.round(portfolio.composition.cash)} Nakit
- Konsantrasyon Riski: ${portfolio.concentration}
- Vergi Tasarruf Fırsatları: ${taxStrategies.map(s => s.strategy).join(", ")}
- Piyasa Fırsatları: ${opportunities.filter(o => o.signal === "BUY").map(o => o.asset).join(", ")}

YÖNERGE:
1. Mevcut portföy dağılımını 1 cümlede değerlendir.
2. Kullanıcının HEMEN yapması gereken 3 somut eylemi (Action Items) listele.
3. Bir tanesi mutlaka vergi optimizasyonuyla ilgili olsun.
4. Dil: Türkçe, Profesyonel ama anlaşılır.

Yanıtını Markdown formatında ver.
`
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error("PortfolioAdvisorAgent error:", error)
      return "Portföyünüz genel olarak dengeli görünüyor. Vergi avantajlı hesapları kullanmayı ve varlık çeşitliliğini artırmayı değerlendirebilirsiniz."
    }
  }
}
