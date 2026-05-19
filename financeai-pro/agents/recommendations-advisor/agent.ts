import { GoogleGenerativeAI } from "@google/generative-ai"

export class RecommendationsAdvisor {
  private genAI: GoogleGenerativeAI

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  async generatePersonalizedAdvice(userId: string, data: {
    spendingInsights: any[]
    suggestedGoals: any[]
    investmentAllocation: any
    rebalancingAlerts: any[]
    spendingOptimizations: any[]
  }): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Finansal danışman AI olarak kullanıcının tüm verilerini sentezle ve bütünsel bir yol haritası sun.

VERİ SETİ:
1. Harcama Analizi: ${JSON.stringify(data.spendingInsights)}
2. Önerilen Hedefler: ${JSON.stringify(data.suggestedGoals)}
3. Yatırım Dağılımı: ${JSON.stringify(data.investmentAllocation)}
4. Uyarılar: ${JSON.stringify(data.rebalancingAlerts)}
5. Tasarruf Fırsatları: ${JSON.stringify(data.spendingOptimizations)}

YÖNERGE:
1. "Geleceğini Birlikte Planlayalım" başlığıyla başla.
2. Harcama alışkanlıkları ile hedefler arasındaki bağı kur (Örn: "Kahveden tasarruf ederek tatil hedefine 3 ay erken ulaşabilirsin").
3. Yatırım tarafında yapılması gereken acil hamleyi belirt.
4. Empatik, motive edici ve tamamen Türkçe bir dil kullan.
5. Maksimum 4 paragraf olsun.

Markdown formatında yanıt ver.
`
    try {
      const result = await model.generateContent(prompt)
      return result.response.text()
    } catch (error) {
      console.error("RecommendationsAdvisor error:", error)
      return "Finansal verileriniz incelendiğinde, bütçe disiplini ve düzenli yatırım ile hedeflerinize ulaşabileceğiniz görülüyor. Özellikle yüksek maliyetli gider kalemlerini optimize ederek tasarruf oranınızı artırmanızı öneririm."
    }
  }
}
