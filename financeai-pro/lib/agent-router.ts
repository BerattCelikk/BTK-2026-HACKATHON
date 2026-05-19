import { embedText } from "./embedding"
import { AgentType } from "@/types"

export interface RoutingResult {
  agentId: AgentType | "orchestrator"
  confidence: number
  reasoning: string
}

interface AgentExpertise {
  id: AgentType
  description: string
  keywords: string[]
}

const AGENT_EXPERTISE: AgentExpertise[] = [
  {
    id: "financial_analyst",
    description: "Finansal analiz, gelir gider analizi, genel durum değerlendirmesi, harcama alışkanlıkları ve anomali tespiti.",
    keywords: ["analiz", "durum", "anomali", "harcama", "gelir", "gider", "rapor"]
  },
  {
    id: "budget_optimizer",
    description: "Bütçe planlama, bütçe oluşturma, tasarruf hedefleri, gider optimizasyonu ve bütçe aşımı uyarıları.",
    keywords: ["bütçe", "plan", "tasarruf", "optimizasyon", "limit", "hedef"]
  },
  {
    id: "investment_advisor",
    description: "Yatırım tavsiyesi, portföy yönetimi, hisse senetleri, altın, döviz ve piyasa analizi.",
    keywords: ["yatırım", "portföy", "hisse", "altın", "borsa", "kripto", "piyasa"]
  },
  {
    id: "debt_manager",
    description: "Borç yönetimi, kredi ödeme stratejileri, borç kapatma planları ve faiz hesaplamaları.",
    keywords: ["borç", "kredi", "taksit", "ödeme", "yapılandırma", "faiz"]
  },
  {
    id: "education_agent",
    description: "Finansal okuryazarlık, terimler, eğitim içerikleri, quizler ve öğrenme materyalleri.",
    keywords: ["öğren", "nedir", "eğitim", "bilgi", "terim", "anlamı", "ders"]
  }
]

// Pre-calculate embeddings for expertise descriptions
let expertiseEmbeddings: { id: AgentType, vector: number[] }[] = []

async function initializeExpertise() {
  if (expertiseEmbeddings.length > 0) return
  
  for (const agent of AGENT_EXPERTISE) {
    const vector = await embedText(agent.description + " " + agent.keywords.join(" "))
    expertiseEmbeddings.push({ id: agent.id, vector })
  }
}

function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i]
    normA += vecA[i] * vecA[i]
    normB += vecB[i] * vecB[i]
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export async function routeToAgent(userQuery: string, context?: any): Promise<RoutingResult> {
  await initializeExpertise()
  
  const queryVector = await embedText(userQuery)
  
  let bestMatch: AgentType | "orchestrator" = "orchestrator"
  let maxSimilarity = 0
  
  for (const expertise of expertiseEmbeddings) {
    const similarity = cosineSimilarity(queryVector, expertise.vector)
    if (similarity > maxSimilarity) {
      maxSimilarity = similarity
      bestMatch = expertise.id
    }
  }

  // Fallback logic
  if (maxSimilarity < 0.6) {
    return {
      agentId: "orchestrator",
      confidence: maxSimilarity,
      reasoning: "Düşük güven oranı nedeniyle orkestratör ajana yönlendirildi."
    }
  }

  return {
    agentId: bestMatch,
    confidence: maxSimilarity,
    reasoning: `İstek konusu ${bestMatch} uzmanlık alanıyla yüksek benzerlik (%${Math.round(maxSimilarity * 100)}) gösteriyor.`
  }
}
