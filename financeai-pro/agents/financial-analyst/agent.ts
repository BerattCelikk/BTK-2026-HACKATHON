import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import prisma from "@/lib/prisma"
import type { AnomalyResult } from "@/types"

export class FinancialAnalystAgent {
  private genAI: GoogleGenerativeAI

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  private getModel() {
    return this.genAI.getGenerativeModel({
      model: "gemini-pro",
      tools: [
        {
          functionDeclarations: [
            {
              name: "fetch_user_transactions",
              description:
                "Kullanıcının finansal işlemlerini (gelir/gider) veritabanından çeker. Finansal analiz yapmak için bu fonksiyonu çağırın.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  userId: {
                    type: SchemaType.STRING,
                    description: "Kullanıcının veritabanı ID'si",
                  },
                  startDate: {
                    type: SchemaType.STRING,
                    description: "Başlangıç tarihi (ISO 8601 formatında, örn: 2026-01-01)",
                  },
                  endDate: {
                    type: SchemaType.STRING,
                    description: "Bitiş tarihi (ISO 8601 formatında, örn: 2026-12-31)",
                  },
                  type: {
                    type: SchemaType.STRING,
                    description: "İşlem türü filtresi: INCOME, EXPENSE, veya ALL",
                    format: "enum",
                    enum: ["INCOME", "EXPENSE", "ALL"],
                  },
                  limit: {
                    type: SchemaType.INTEGER,
                    description: "Maksimum işlem sayısı (varsayılan: 50)",
                  },
                },
                required: ["userId"],
              },
            },
          ],
        },
      ],
      systemInstruction:
        "Sen profesyonel bir finansal analistsin. Kullanıcının mali durumunu analiz etmek için fetch_user_transactions fonksiyonunu kullan. Önce işlemleri çek, sonra detaylı analiz yap. Gelir, gider, tasarruf oranı, harcama kategorileri ve risk alanlarını değerlendir. Yanıtını Türkçe ve markdown formatında ver.",
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
        if (args.type && args.type !== "ALL") {
          where.type = args.type
        }
        const transactions = await prisma.transaction.findMany({
          where,
          orderBy: { date: "desc" },
          take: args.limit || 50,
        })
        return { transactions }
      }
      default:
        return { error: `Unknown tool: ${name}` }
    }
  }

  async analyzeFinances(
    query: string,
    userId: string
  ): Promise<{
    analysis: any
    summary: string
  }> {
    const chat = this.getModel().startChat()

    let result = await chat.sendMessage([
      {
        text: `Kullanıcının sorusu: "${query}"\n\nKullanıcı ID: ${userId}\n\nFinansal analiz yapmak için fetch_user_transactions fonksiyonunu kullan ve detaylı bir rapor hazırla.`,
      },
    ])

    let response = result.response
    let calls = response.functionCalls()

    while (calls && calls.length > 0) {
      const parts: any[] = []

      for (const call of calls) {
        const fnResult = await this.executeToolCall(call.name, call.args)
        parts.push({
          functionResponse: {
            name: call.name,
            response: fnResult,
          },
        })
      }

      result = await chat.sendMessage(parts)
      response = result.response
      calls = response.functionCalls()
    }

    const summary = response.text()

    const transactionData = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    })

    const totalIncome = transactionData.filter((t) => t.type === "INCOME").reduce((s, t) => s + t.amount, 0)
    const totalExpenses = transactionData.filter((t) => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0)
    const netSavings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

    const expenseBreakdown = Object.entries(
      transactionData
        .filter((t) => t.type === "EXPENSE")
        .reduce(
          (acc, t) => {
            const key = t.category
            if (!acc[key]) acc[key] = 0
            acc[key] += t.amount
            return acc
          },
          {} as Record<string, number>
        )
    ).map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
    }))

    return {
      analysis: {
        totalIncome,
        totalExpenses,
        netSavings,
        savingsRate: Math.round(savingsRate * 100) / 100,
        expenseBreakdown,
      },
      summary,
    }
  }

  async detectAnomalies(userId: string): Promise<AnomalyResult[]> {
    try {
      const threeMonthsAgo = new Date()
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)

      const transactions = await prisma.transaction.findMany({
        where: { userId, date: { gte: threeMonthsAgo } },
        orderBy: { date: "desc" },
        take: 200,
      })

      if (transactions.length < 5) return []

      const expenses = transactions.filter((t) => t.type === "EXPENSE")
      const expenseSummary = expenses.map((t) => ({
        date: t.date.toISOString().split("T")[0],
        category: t.category,
        amount: t.amount,
        description: t.description,
      }))

      const prompt = `Aşağıdaki son 3 aylık harcama verilerini analiz et. Şunları bul:
1. Bir kategoride normalden çok yüksek harcama (spike)
2. Aynı gün aynı tutarda potansiyel mükerrer ödeme (duplicate)
3. Alışılmadık harcama desenleri (unusual)

Sadece JSON dizi olarak yanıt ver, başka metin ekleme:
[
  {
    "type": "spike"|"duplicate"|"unusual",
    "severity": "high"|"medium"|"low",
    "category": "KATEGORI_ADI",
    "amount": 0,
    "description": "Türkçe açıklama",
    "suggestion": "Türkçe öneri"
  }
]

Eğer anormallik yoksa boş dizi [] döndür.

Veriler:
${JSON.stringify(expenseSummary)}`

      const flashModel = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const result = await flashModel.generateContent(prompt)
      const text = result.response.text()
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) return []

      let anomalies: AnomalyResult[]
      try {
        anomalies = JSON.parse(jsonMatch[0])
      } catch {
        const cleaned = jsonMatch[0].replace(/(\w+):/g, '"$1":')
        anomalies = JSON.parse(cleaned)
      }

      return Array.isArray(anomalies) ? anomalies.slice(0, 5) : []
    } catch (error) {
      console.error("Anomaly detection error:", error)
      return []
    }
  }

  async generateAnalysisSummary(analysis: any): Promise<string> {
    const statusEmoji = analysis.cashFlowStatus === "positive" ? "olumlu" : analysis.cashFlowStatus === "negative" ? "olumsuz" : "nötr"

    return [
      "**Finansal Analiz Raporu**",
      "",
      `**Genel Durum:** ${statusEmoji.toUpperCase()}`,
      `- Aylık Gelir: ${(analysis.totalIncome || 0).toLocaleString("tr-TR")} TL`,
      `- Aylık Gider: ${(analysis.totalExpenses || 0).toLocaleString("tr-TR")} TL`,
      `- Net Tasarruf: ${(analysis.netSavings || 0).toLocaleString("tr-TR")} TL`,
      `- Tasarruf Oranı: %${analysis.savingsRate || 0}`,
      "",
      "**Tavsiyeler:**",
      ...(analysis.recommendations || []).map((r: string) => `- ${r}`),
      "",
      "**Risk Alanları:**",
      ...(analysis.riskAreas || []).map((r: string) => `- ${r}`),
      "",
      "**Detaylı Öneriler:**",
      ...(analysis.insights || []).map((i: string) => `- ${i}`),
      "",
    ].join("\n")
  }
}
