import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import prisma from "@/lib/prisma"
import type { AnomalyResult } from "@/types"

export class FinancialAnalystAgent {
  private genAI: GoogleGenerativeAI

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) throw new Error("GEMINI_API_KEY bulunamadı")
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  private getModel() {
    return this.genAI.getGenerativeModel({
      model: "gemini-pro",
      tools: [
        {
          functionDeclarations: [
            {
              name: "fetch_user_transactions",
              description: "Kullanıcının finansal işlemlerini (gelir/gider) veritabanından çeker.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  userId: { type: SchemaType.STRING, description: "Kullanıcının veritabanı ID'si" },
                  startDate: { type: SchemaType.STRING, description: "Başlangıç tarihi (ISO 8601)" },
                  endDate: { type: SchemaType.STRING, description: "Bitiş tarihi (ISO 8601)" },
                  type: { type: SchemaType.STRING, description: "İşlem türü: INCOME, EXPENSE, ALL", format: "enum", enum: ["INCOME", "EXPENSE", "ALL"] },
                  limit: { type: SchemaType.INTEGER, description: "Maksimum işlem sayısı" },
                },
                required: ["userId"],
              },
            },
          ],
        },
      ],
      systemInstruction:
        "Sen profesyonel bir finansal analistsin. Kullanıcının mali durumunu analiz etmek için fetch_user_transactions fonksiyonunu kullan. Önce işlemleri çek, sonra detaylı analiz yap. Gelir, gider, tasarruf oranı, harcama kategorileri ve risk alanlarını değerlendir. Türkçe yanıt ver, samimi ama profesyonel ol.",
    })
  }

  private async executeToolCall(name: string, args: any): Promise<object> {
    switch (name) {
      case "fetch_user_transactions": {
        const where: any = { userId: args.userId }
        if (args.startDate || args.endDate) {
          where.date = {}
          if (args.startDate) where.date.gte = new Date(args.startDate)
          if (args.endDate) where.date.lte = new Date(args.endDate)
        }
        if (args.type && args.type !== "ALL") where.type = args.type
        const transactions = await prisma.transaction.findMany({
          where,
          orderBy: { date: "desc" },
          take: args.limit || 50,
        })
        return { transactions }
      }
      default:
        return { error: `Bilinmeyen araç: ${name}` }
    }
  }

  async analyzeFinances(query: string, userId: string): Promise<{ analysis: any; summary: string }> {
    const chat = this.getModel().startChat()
    let result = await chat.sendMessage([
      { text: `Kullanıcının sorusu: "${query}"\n\nKullanıcı ID: ${userId}\n\nFinansal analiz yapmak için fetch_user_transactions fonksiyonunu kullan ve detaylı bir rapor hazırla.` },
    ])
    let response = result.response
    let calls = response.functionCalls()
    while (calls && calls.length > 0) {
      const parts: any[] = []
      for (const call of calls) {
        const fnResult = await this.executeToolCall(call.name, call.args)
        parts.push({ functionResponse: { name: call.name, response: fnResult } })
      }
      result = await chat.sendMessage(parts)
      response = result.response
      calls = response.functionCalls()
    }
    const summary = response.text()
    const transactionData = await prisma.transaction.findMany({ where: { userId }, orderBy: { date: "desc" } })
    const totalIncome = transactionData.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const totalExpenses = transactionData.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0
    const expenseBreakdown = Object.entries(
      transactionData
        .filter((t) => t.type === "EXPENSE")
        .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc }, {} as Record<string, number>)
    ).map(([name, amount]) => ({ name, amount, percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0 }))
    return {
      analysis: { totalIncome, totalExpenses, netSavings, savingsRate: Math.round(savingsRate * 100) / 100, expenseBreakdown },
      summary,
    }
  }

  async detectAnomalies(userId: string): Promise<AnomalyResult[]> {
    try {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
      const recentExpenses = await prisma.transaction.findMany({
        where: { userId, type: "EXPENSE", date: { gte: threeMonthsAgo } },
      })
      if (recentExpenses.length < 5) return []

      const categorySums = recentExpenses.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      }, {} as Record<string, number>)

      const totalExpenses = Object.values(categorySums).reduce((a, b) => a + b, 0)
      const averageMonthly = totalExpenses / 3

      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const prompt = `
Kullanıcının gider verilerini analiz ederek anormallikleri tespit et.

Samimi ve yardımcı bir ton kullan. Sorun işaret et ama suçlama yapma. Çözüm önerisi ver. Spesifik tutarlar ver.

VERİ:
${JSON.stringify({ categorySums, averageMonthly, totalExpenses })}

BUL (max 5 anomali):
1. Kategori bazında normal giderden %50+ fazla (spike)
2. Tekrar eden aynı tutarlar (muhtemelen kopya/abonelik)
3. Sıra dışı kategorilerde anormal yüksek giderler

CEVAP: Sadece JSON formatında, Türkçe açıklamalarla
{
  "anomalies": [
    {
      "type": "spike|duplicate|unusual",
      "severity": "high|medium|low",
      "category": "Kategori Adı",
      "amount": 1000,
      "description": "Türkçe açıklama",
      "suggestion": "Türkçe tavsiye"
    }
  ]
}
`
      const result = await model.generateContent(prompt)
      const text = result.response.text()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return []
      const parsed = JSON.parse(jsonMatch[0])
      return (parsed.anomalies || []).slice(0, 5)
    } catch (error) {
      console.error("Anomali tespit hatası:", error)
      return []
    }
  }

  async optimizeSpending(categoryBreakdown: Record<string, number>): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const totalSpending = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0)
    const prompt = `
Kullanıcının gider kategorilerine bakarak tasarruf stratejisi sun.

HARCAMA DAĞILIMI:
${Object.entries(categoryBreakdown).map(([cat, amount]) => `- ${cat}: ${amount.toLocaleString("tr-TR")} TL (%${(amount / totalSpending * 100).toFixed(0)})`).join("\n")}
TOPLAM: ${totalSpending.toLocaleString("tr-TR")} TL

YÖNERGE:
- En yüksek 3 kategoriyi analiz et
- Her biri için %10-20 tasarruf potansiyelini hesapla
- Somut, uygulanabilir öneriler sun
- Hayat kalitesini düşürmeyecek şekilde yaz

FORMAT (Türkçe):
Tasarruf Stratejiniz
En Yüksek Gider: [Kategori]
[Analiz ve 2-3 somut tavsiye]
Hızlı Kazanımlar
[3-5 madde, TL cinsinden beklenen tasarruf]
3 Aylık Hedef
"Eğer bu tavsiyeleri uygularsanız ayda XXX TL tasarruf edebilirsiniz."
`
    const result = await model.generateContent(prompt)
    return result.response.text()
  }

  async generateAnalysisSummary(analysis: any): Promise<string> {
    const cashFlowText = analysis.cashFlowStatus === "positive" ? "olumlu 📈" : analysis.cashFlowStatus === "negative" ? "olumsuz 📉" : "nötr →"
    return [
      "📊 **FİNANSAL ANALİZ ÖZETİ**",
      "",
      `**Nakit Akışı:** ${cashFlowText}`,
      `**Aylık Gelir:** ${(analysis.totalIncome || 0).toLocaleString("tr-TR")} TL`,
      `**Aylık Gider:** ${(analysis.totalExpenses || 0).toLocaleString("tr-TR")} TL`,
      `**Net Tasarruf:** ${(analysis.netSavings || 0).toLocaleString("tr-TR")} TL`,
      `**Tasarruf Oranı:** %${analysis.savingsRate || 0}`,
      "",
      "**Öneriler:**",
      ...(analysis.recommendations || []).map((r: string) => `- ${r}`),
      "",
      "**Risk Alanları:**",
      ...(analysis.riskAreas || []).map((r: string) => `- ${r}`),
    ].join("\n")
  }
}
