import { GoogleGenerativeAI } from "@google/generative-ai"

interface RAGDocument {
  id: string
  content: string
  metadata: {
    topic: string
    difficulty: string
    category: string
  }
}

const KNOWLEDGE_BASE: RAGDocument[] = [
  {
    id: "1",
    content: "Bütçe Planlaması: Gelir ve giderlerinizi takip ederek aylık bütçe oluşturun. 50/30/20 kuralını kullanın: %50 ihtiyaçlar, %30 istekler, %20 tasarruf ve yatırım.",
    metadata: { topic: "budgeting", difficulty: "beginner", category: "personal-finance" },
  },
  {
    id: "2",
    content: "Acil Durum Fonu: En az 3-6 aylık yaşam giderlerinizi karşılayacak acil durum fonu oluşturun. Bu fon beklenmedik durumlarda finansal güvence sağlar.",
    metadata: { topic: "savings", difficulty: "beginner", category: "personal-finance" },
  },
  {
    id: "3",
    content: "Bileşik Faiz: Paranızın zaman içinde katlanarak büyümesini sağlayan bileşik faiz, uzun vadeli yatırımın en güçlü aracıdır. Ne kadar erken başlarsanız o kadar çok kazanırsınız.",
    metadata: { topic: "investing", difficulty: "intermediate", category: "investment" },
  },
  {
    id: "4",
    content: "Risk Yönetimi: Yatırımlarınızı çeşitlendirerek riski dağıtın. Farklı varlık sınıflarına (hisse senedi, tahvil, emtia, nakit) yatırım yaparak portföy riskinizi azaltın.",
    metadata: { topic: "risk-management", difficulty: "intermediate", category: "investment" },
  },
  {
    id: "5",
    content: "Borç Yönetimi: Kartopu yöntemi (önce küçük borçları kapatın) veya çığ yöntemi (önce yüksek faizli borçları kapatın) ile borçlarınızı yapılandırın.",
    metadata: { topic: "debt", difficulty: "beginner", category: "debt-management" },
  },
  {
    id: "6",
    content: "BIST 100: Borsa İstanbul'un ana endeksidir. Türkiye'nin en büyük 100 şirketinin hisse performansını ölçer. Uzun vadeli yatırım için düzenli alım stratejisi önerilir.",
    metadata: { topic: "stock-market", difficulty: "intermediate", category: "investment" },
  },
  {
    id: "7",
    content: "Kripto Para: Yüksek riskli ve volatil bir yatırım aracıdır. Portföyünüzün maksimum %5-10'unu kripto paralara ayırmanız önerilir. Yalnızca kaybetmeyi göze alabileceğiniz miktarı yatırın.",
    metadata: { topic: "crypto", difficulty: "advanced", category: "investment" },
  },
  {
    id: "8",
    content: "Türkiye'de Vergilendirme: Hisse senedi alım-satım kazançları, kira gelirleri ve serbest meslek kazançları için yıllık beyanname vermeniz gerekebilir. Güncel vergi dilimlerini takip edin.",
    metadata: { topic: "tax", difficulty: "advanced", category: "regulations" },
  },
  {
    id: "9",
    content: "Kredi Puanı: Kredi notunuzu yükseltmek için faturalarınızı zamanında ödeyin, kredi kartı limitinizin %30'undan azını kullanın ve uzun vadeli kredi geçmişi oluşturun.",
    metadata: { topic: "credit", difficulty: "beginner", category: "personal-finance" },
  },
  {
    id: "10",
    content: "Gayrimenkul Yatırımı: Konut kredisi ile ev alırken faiz oranlarına dikkat edin. Kira getirisi hesaplarken yıllık bakım maliyetini (%1-2) ve boş kalma riskini hesaba katın.",
    metadata: { topic: "real-estate", difficulty: "intermediate", category: "investment" },
  },
  {
    id: "11",
    content: "Enflasyon ve Satın Alma Gücü: Türkiye'de enflasyon, paranızın satın alma gücünü azaltır. Tasarruflarınızı enflasyonun üzerinde getiri sağlayacak yatırım araçlarında değerlendirin.",
    metadata: { topic: "inflation", difficulty: "intermediate", category: "economy" },
  },
  {
    id: "12",
    content: "Yatırım Hesabı Türleri: Vadeli hesap, altın hesabı, döviz tevdiat hesabı (DTH), hisse senedi hesabı ve yatırım fonu hesabı gibi farklı hesap türlerini ihtiyacınıza göre seçin.",
    metadata: { topic: "accounts", difficulty: "beginner", category: "banking" },
  },
]

export class FinancialRAG {
  async query(query: string): Promise<{ content: string; relevance: number }[]> {
    const queryLower = query.toLowerCase()
    const queryTerms = queryLower.split(/\s+/)

    const results = KNOWLEDGE_BASE.map((doc) => {
      const docLower = doc.content.toLowerCase()
      let score = 0

      for (const term of queryTerms) {
        if (term.length < 3) continue
        if (docLower.includes(term)) {
          score += 1
        }
        if (doc.metadata.topic.toLowerCase().includes(term)) {
          score += 2
        }
        if (doc.metadata.category.toLowerCase().includes(term)) {
          score += 1.5
        }
      }

      return {
        content: doc.content,
        relevance: score,
        metadata: doc.metadata,
      }
    })
      .filter((r) => r.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 5)
      .map((r) => ({
        content: r.content,
        relevance: r.relevance,
      }))

    return results
  }

  async generateContextualAnswer(query: string, geminiApi: any): Promise<string> {
    const relevantDocs = await this.query(query)
    const context = relevantDocs.map((d) => d.content).join("\n\n")

    const prompt = `
Aşağıdaki finansal bilgi tabanına dayanarak kullanıcının sorusunu yanıtla.

Bilgi Tabanı:
${context || "Bu konuda doğrudan bilgi bulunamadı. Genel finansal bilgine dayanarak yanıtla."}

Kullanıcı Sorusu: ${query}

Yanıtını Türkçe olarak ver. Finansal tavsiye verirken dengeli ve objektif ol. Gerekirse uyarılar ekle.

Yanıt:
    `

    return prompt
  }

  async getLessonContent(topic: string): Promise<RAGDocument[]> {
    return KNOWLEDGE_BASE.filter(
      (doc) =>
        doc.metadata.topic === topic || doc.metadata.category === topic
    )
  }

  getAllTopics(): { topic: string; category: string }[] {
    const topics = new Map<string, { topic: string; category: string }>()
    for (const doc of KNOWLEDGE_BASE) {
      if (!topics.has(doc.metadata.topic)) {
        topics.set(doc.metadata.topic, {
          topic: doc.metadata.topic,
          category: doc.metadata.category,
        })
      }
    }
    return Array.from(topics.values())
  }
}

export const financialRAG = new FinancialRAG()
