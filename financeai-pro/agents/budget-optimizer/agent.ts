import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import prisma from "@/lib/prisma"
import { getModel } from "@/lib/gemini"
import { generateRAGContext } from "@/lib/rag-query"

export class BudgetOptimizerAgent {
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
                "Kullanıcının mevcut harcama alışkanlıklarını analiz etmek için işlemlerini veritabanından çeker.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  userId: {
                    type: SchemaType.STRING,
                    description: "Kullanıcının veritabanı ID'si",
                  },
                  limit: {
                    type: SchemaType.INTEGER,
                    description: "Maksimum işlem sayısı (varsayılan: 100)",
                  },
                },
                required: ["userId"],
              },
            },
            {
              name: "save_budget_to_db",
              description:
                "Kullanıcının onayladığı bütçe planını veritabanına kaydeder. Kullanıcı bütçeyi onayladıktan sonra bu fonksiyonu çağırın.",
              parameters: {
                type: SchemaType.OBJECT,
                properties: {
                  userId: {
                    type: SchemaType.STRING,
                    description: "Kullanıcının veritabanı ID'si",
                  },
                  budgets: {
                    type: SchemaType.ARRAY,
                    description: "Kaydedilecek bütçe kalemleri dizisi",
                    items: {
                      type: SchemaType.OBJECT,
                      properties: {
                        category: {
                          type: SchemaType.STRING,
                          description:
                            "Kategori adı (RENT, UTILITIES, GROCERIES, DINING, TRANSPORTATION, HEALTHCARE, ENTERTAINMENT, SHOPPING, EDUCATION, SAVINGS, INSURANCE, DEBT_PAYMENT, OTHER)",
                          format: "enum",
                          enum: [
                            "RENT",
                            "UTILITIES",
                            "GROCERIES",
                            "DINING",
                            "TRANSPORTATION",
                            "HEALTHCARE",
                            "ENTERTAINMENT",
                            "SHOPPING",
                            "EDUCATION",
                            "SAVINGS",
                            "INSURANCE",
                            "DEBT_PAYMENT",
                            "OTHER",
                          ],
                        },
                        amount: {
                          type: SchemaType.NUMBER,
                          description: "Bütçe miktarı (TL)",
                        },
                        month: {
                          type: SchemaType.INTEGER,
                          description: "Ay (1-12)",
                        },
                        year: {
                          type: SchemaType.INTEGER,
                          description: "Yıl (örn: 2026)",
                        },
                      },
                      required: ["category", "amount", "month", "year"],
                    },
                  },
                },
                required: ["userId", "budgets"],
              },
            },
          ],
        },
      ],
      systemInstruction:
        "Sen bir bütçe optimizasyon uzmanısın. Kullanıcının harcamalarını analiz et, 50/30/20 kuralına göre bütçe planı oluştur ve kullanıcı onayladığında save_budget_to_db ile veritabanına kaydet. Önce fetch_user_transactions ile mevcut işlemleri çek, analiz yap, bütçe önerisini sun, kullanıcı onaylarsa kaydet. Yanıtını Türkçe ve markdown formatında ver.",
    })
  }

  private async executeToolCall(name: string, args: any): Promise<object> {
    switch (name) {
      case "fetch_user_transactions": {
        const transactions = await prisma.transaction.findMany({
          where: { userId: args.userId },
          orderBy: { date: "desc" },
          take: args.limit || 100,
        })
        return { transactions }
      }
      case "save_budget_to_db": {
        const saved = []
        for (const b of args.budgets || []) {
          const budget = await prisma.budget.upsert({
            where: {
              userId_category_month_year: {
                userId: args.userId,
                category: b.category,
                month: b.month,
                year: b.year,
              },
            },
            update: { amount: b.amount },
            create: {
              userId: args.userId,
              category: b.category,
              amount: b.amount,
              month: b.month,
              year: b.year,
            },
          })
          saved.push(budget)
        }
        return { success: true, saved: saved.length }
      }
      default:
        return { error: `Unknown tool: ${name}` }
    }
  }

  async createBudgetWithTools(query: string, userId: string): Promise<string> {
    const ragContext = await generateRAGContext(query)
    const enhancedPrompt = `${ragContext}\n\nKullanıcının talebi: "${query}"\n\nKullanıcı ID: ${userId}\n\nİlk olarak fetch_user_transactions ile kullanıcının işlemlerini çek, analiz et ve bütçe önerisi sun. Bilgi tabanındaki (RAG) bütçe kurallarını (örn: 50/30/20) temel al. Kullanıcı bütçeyi onaylarsa save_budget_to_db ile kaydet.`

    const chat = this.getModel().startChat()

    let result = await chat.sendMessage([{ text: enhancedPrompt }])

    let response = result.response
    let calls = response.functionCalls()

    let maxTurns = 10
    while (calls && calls.length > 0 && maxTurns > 0) {
      maxTurns--
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

    return response.text()
  }

  async createBudget(
    income: number,
    currentExpenses: { name: string; amount: number }[],
    goals: { title: string; targetAmount: number }[]
  ) {
    const totalEssential = currentExpenses
      .filter((e) => ["RENT", "UTILITIES", "GROCERIES", "INSURANCE", "TRANSPORTATION"].includes(e.name))
      .reduce((s, e) => s + e.amount, 0)

    const wantsBudget = income * 0.3
    const savingsTarget = income * 0.2
    const needsBudget = income * 0.5

    const categories = [
      { name: "Kira & Faturalar", planned: Math.round(needsBudget * 0.5), actual: currentExpenses.find((e) => e.name === "RENT")?.amount ?? 0, variance: 0, status: "on_track" as const },
      { name: "Market & Gıda", planned: Math.round(needsBudget * 0.2), actual: currentExpenses.find((e) => e.name === "GROCERIES")?.amount ?? 0, variance: 0, status: "on_track" as const },
      { name: "Ulaşım", planned: Math.round(needsBudget * 0.1), actual: currentExpenses.find((e) => e.name === "TRANSPORTATION")?.amount ?? 0, variance: 0, status: "on_track" as const },
      { name: "Sağlık & Sigorta", planned: Math.round(needsBudget * 0.1), actual: currentExpenses.find((e) => e.name === "HEALTHCARE")?.amount ?? 0, variance: 0, status: "on_track" as const },
      { name: "Eğlence & Hobi", planned: Math.round(wantsBudget * 0.4), actual: currentExpenses.find((e) => e.name === "ENTERTAINMENT")?.amount ?? 0, variance: 0, status: "on_track" as const },
      { name: "Alışveriş", planned: Math.round(wantsBudget * 0.3), actual: currentExpenses.find((e) => e.name === "SHOPPING")?.amount ?? 0, variance: 0, status: "on_track" as const },
      { name: "Tasarruf & Yatırım", planned: Math.round(savingsTarget), actual: currentExpenses.find((e) => e.name === "SAVINGS")?.amount ?? 0, variance: 0, status: "on_track" as const },
      { name: "Borç Ödemeleri", planned: Math.round(savingsTarget * 0.5), actual: currentExpenses.find((e) => e.name === "DEBT_PAYMENT")?.amount ?? 0, variance: 0, status: "on_track" as const },
    ]

    const updatedCategories = categories.map((cat) => {
      const variance = cat.actual - cat.planned
      const status =
        cat.name === "Tasarruf & Yatırım"
          ? variance >= 0 ? "under" : "over"
          : variance <= 0 ? "under" : "over"
      return { ...cat, variance: Math.abs(variance), status: status as "under" | "over" | "on_track" }
    })

    const totalBudget = income
    const totalSpent = currentExpenses.reduce((s, e) => s + e.amount, 0)

    const savingsOpportunities = [
      {
        area: "Dışarıda Yemek",
        currentSpending: currentExpenses.find((e) => e.name === "DINING")?.amount ?? 0,
        potentialSavings: Math.round((currentExpenses.find((e) => e.name === "DINING")?.amount ?? 0) * 0.4),
        suggestion: "Evde yemek yaparak dışarıda yemek masrafınızı %40 azaltabilirsiniz.",
      },
      {
        area: "Abonelikler",
        currentSpending: currentExpenses.find((e) => e.name === "ENTERTAINMENT")?.amount ?? 0,
        potentialSavings: Math.round((currentExpenses.find((e) => e.name === "ENTERTAINMENT")?.amount ?? 0) * 0.3),
        suggestion: "Kullanmadığınız abonelikleri iptal ederek tasarruf edin.",
      },
      {
        area: "Alışveriş",
        currentSpending: currentExpenses.find((e) => e.name === "SHOPPING")?.amount ?? 0,
        potentialSavings: Math.round((currentExpenses.find((e) => e.name === "SHOPPING")?.amount ?? 0) * 0.25),
        suggestion: "Alışveriş öncesi bütçe belirleyin ve indirimleri takip edin.",
      },
    ]

    return {
      categories: updatedCategories,
      totalBudget,
      totalSpent,
      remainingBudget: totalBudget - totalSpent,
      optimizationTips: [
        "50/30/20 kuralını uygulayın: %50 ihtiyaç, %30 istek, %20 tasarruf",
        "Faturalarınızı otomatik ödemeye alın, gecikme ücretlerinden kaçının",
        "Market alışverişine listeden sapmadan çıkın",
      ],
      savingsOpportunities: savingsOpportunities.filter((s) => s.currentSpending > 0),
    }
  }

  async generateBudgetSummary(budget: any): Promise<string> {
    const statusSummary = budget.categories
      .map((c: any) => `- ${c.name}: ${c.status === "over" ? "🔴 Limit Aşıldı" : c.status === "under" ? "✅ Bütçe İçinde" : "📍 Takip Ediliyor"}`)
      .join("\n")

    return [
      "**Bütçe Optimizasyon Raporu**",
      "",
      "**Özet:**",
      `- Toplam Bütçe: ${budget.totalBudget.toLocaleString("tr-TR")} TL`,
      `- Toplam Harcama: ${budget.totalSpent.toLocaleString("tr-TR")} TL`,
      `- Kalan Bütçe: ${budget.remainingBudget.toLocaleString("tr-TR")} TL`,
      "",
      "**Kategori Durumu:**",
      statusSummary,
      "",
      "**Tasarruf Fırsatları:**",
      ...budget.savingsOpportunities.map((s: any) => `- ${s.area}: Potansiyel ${s.potentialSavings.toLocaleString("tr-TR")} TL tasarruf`),
      "",
    ].join("\n")
  }
}
