import { GoogleGenerativeAI } from "@google/generative-ai"
import { generateRAGContext } from "@/lib/rag-query"
import { anomalyDetector } from "@/lib/anomaly-detection"
import { ForecastPoint } from "@/lib/wealth-forecast"

export class WealthAdvisorAgent {
  private genAI: GoogleGenerativeAI

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  async analyzeForecast(projection: ForecastPoint[], userId: string): Promise<{
    recommendations: string[]
    analysis: string
    marketContext: string
  }> {
    // Gather insights
    const [anomalies, ragContext] = await Promise.all([
      anomalyDetector.detectAll(userId),
      generateRAGContext("servet yönetimi ve uzun vadeli yatırım stratejileri")
    ])

    const finalPoint = projection[projection.length - 1]
    const initialPoint = projection[0]
    const totalGains = finalPoint.amount - finalPoint.invested

    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    
    const prompt = `
${ragContext}

Kullanıcının ${projection.length - 1} yıllık varlık projeksiyonunu analiz et.

PROJEKSİYON VERİLERİ:
- Başlangıç: ${initialPoint.amount.toLocaleString("tr-TR")} TL
- Aylık Birikim Hedefi: ${Math.round((finalPoint.invested - initialPoint.invested) / ((projection.length - 1) * 12)).toLocaleString("tr-TR")} TL
- Dönem Sonu Tahmini: ${finalPoint.amount.toLocaleString("tr-TR")} TL
- Tahmini Toplam Kazanç: ${totalGains.toLocaleString("tr-TR")} TL

SİSTEM TARAFINDAN TESPİT EDİLEN ANOMALİLER:
${anomalies.length > 0 ? anomalies.map(a => `- ${a.message}`).join("\n") : "Anomali tespit edilmedi."}

YÖNERGE:
1. Projeksiyonun gerçekçiliğini değerlendir.
2. Anomalilere (harcama sıçramaları vb.) dayanarak uyarılarda bulun.
3. Servet inşası için 3 adet somut Türkçe tavsiye ver.
4. Piyasa bağlamı ekle (BIST, Altın, Kripto gibi varlıkların uzun vadeli etkileri).

Sadece JSON yanıtı ver:
{
  "analysis": "Kısa ve öz analiz metni",
  "recommendations": ["Tavsiye 1", "Tavsiye 2", "Tavsiye 3"],
  "marketContext": "Piyasa bağlamı ve genel ekonomik görünüm"
}
`
    try {
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error("WealthAdvisorAgent error:", error)
    }

    return {
      analysis: "Varlık projeksiyonunuz düzenli birikim ve bileşik getiri gücüyle güçlü bir büyüme potansiyeli gösteriyor.",
      recommendations: [
        "Aylık birikim tutarınızı her yıl enflasyon oranında artırarak hedefinize daha hızlı ulaşın.",
        "Gereksiz harcamaları minimize ederek birikim oranınızı %5-10 artırmayı hedefleyin.",
        "Portföyünüzü çeşitlendirerek piyasa risklerini dağıtın."
      ],
      marketContext: "Mevcut piyasa koşullarında hisse senedi ve altın gibi varlıklar uzun vadede enflasyona karşı koruma sağlama eğilimindedir."
    }
  }
}
