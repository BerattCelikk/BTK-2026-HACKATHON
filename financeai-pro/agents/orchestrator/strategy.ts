import { GoogleGenerativeAI } from "@google/generative-ai"

export interface UserContext {
  name: string
  income: number
  expenses: number
  savingsRate: number
  healthScore: number
  hasDebt: boolean
  investmentExperience: "beginner" | "intermediate" | "advanced"
}

export class OrchestratorAgent {
  private genAI: GoogleGenerativeAI

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  async classifyIntent(
    userQuery: string,
    context: UserContext
  ): Promise<{
    intent: string
    agent: "analyst" | "investor" | "budget" | "education" | "debt" | "general"
    confidence: number
    reasoning: string
  }> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
Finansal danışman AI sistemi olarak kullanıcının sorusunun niyetini anla.

KULLANICI PROFİLİ:
- Ad: ${context.name}
- Aylık Gelir: ${context.income} TL
- Aylık Gider: ${context.expenses} TL
- Tasarruf Oranı: %${context.savingsRate}
- Finansal Sağlık: ${context.healthScore}/100
- Borcu Var: ${context.hasDebt ? "Evet" : "Hayır"}
- Yatırım Tecrübesi: ${context.investmentExperience}

AJAN SEÇENEKLERİ:
- "analyst" → Bütçe analizi, gider optimizasyonu, anomali tespiti
- "investor" → Yatırım, portföy, piyasa
- "budget" → Bütçe planlama, masraf takibi
- "education" → Finansal okuryazarlık, kavram öğrenme
- "debt" → Borç yönetimi, ödeme stratejisi
- "general" → Genel bilgi, tavsiye

SORU: "${userQuery}"

KURAL: Bağlamı kullan. Borcu varsa debt ajanını tercih et. Yeni başladıysa education tercih et.

YANIT (sadece JSON):
{
  "intent": "türkçe niyet açıklaması",
  "agent": "seçilen ajan",
  "confidence": 0.95,
  "reasoning": "neden bu ajan seçildi"
}
`
    const result = await model.generateContent(prompt)
    const jsonMatch = result.response.text().match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { intent: "Genel finansal danışmanlık", agent: "general", confidence: 0.5, reasoning: "Varsayılan yönlendirme" }
    }
    try {
      return JSON.parse(jsonMatch[0])
    } catch {
      return { intent: "Genel finansal danışmanlık", agent: "general", confidence: 0.5, reasoning: "Varsayılan yönlendirme" }
    }
  }

  generateContextualGreeting(context: UserContext): string {
    if (context.healthScore >= 80) {
      return "Harika gidiyorsun! 📈 Finansal durumun oldukça sağlıklı. Şunları değerlendirelim:"
    }
    if (context.healthScore >= 60) {
      return "İyi yoldasın! Birkaç alanda iyileştirme ile skorunu daha da yükseltebilirsin."
    }
    if (context.hasDebt) {
      return "Borç yönetimi finansal sağlığın için kritik. Hadi birlikte bir strateji belirleyelim."
    }
    return "Finansal durumunu iyileştirmek için doğru yerdesin. Adım adım ilerleyelim."
  }
}
