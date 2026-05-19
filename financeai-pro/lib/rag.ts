import { embedText } from "./embedding"
import prisma from "./prisma"
import { KNOWLEDGE_BASE_ARTICLES } from "./knowledge-base"

export class FinancialRAG {
  /**
   * Performs semantic search on the knowledge base using vector similarity.
   */
  async query(queryText: string, limit: number = 3): Promise<{ content: string; title: string; category: string; relevance: number }[]> {
    try {
      const embedding = await embedText(queryText)
      const vectorString = `[${embedding.join(",")}]`

      // PostgreSQL vector similarity search using pgvector
      // We use <=> operator for cosine distance (1 - cosine similarity)
      const results = await prisma.$queryRaw<any[]>`
        SELECT id, title, content, category, 1 - (embedding <=> ${vectorString}::vector) as relevance
        FROM "KnowledgeBase"
        ORDER BY embedding <=> ${vectorString}::vector
        LIMIT ${limit}
      `

      return results.map((r) => ({
        id: r.id,
        title: r.title,
        content: r.content,
        category: r.category,
        relevance: r.relevance,
      }))
    } catch (error) {
      console.error("[RAG] Vector search error:", error)
      return []
    }
  }

  /**
   * Seeds the database with the initial knowledge base articles and their embeddings.
   */
  async seedKnowledgeBase() {
    console.log("[RAG] Seeding KnowledgeBase with embeddings...")
    
    for (const article of KNOWLEDGE_BASE_ARTICLES) {
      try {
        console.log(`[RAG] Processing article: ${article.title}`)
        const embedding = await embedText(article.content)
        const vectorString = `[${embedding.join(",")}]`
        
        // Check if article already exists by title to avoid duplicates
        const existing = await prisma.knowledgeBase.findFirst({
          where: { title: article.title }
        })

        if (existing) {
          await prisma.$executeRaw`
            UPDATE "KnowledgeBase"
            SET content = ${article.content},
                category = ${article.category},
                embedding = ${vectorString}::vector,
                "updatedAt" = NOW()
            WHERE id = ${existing.id}
          `
        } else {
          await prisma.$executeRaw`
            INSERT INTO "KnowledgeBase" (id, title, content, category, embedding, "createdAt", "updatedAt")
            VALUES (gen_random_uuid()::text, ${article.title}, ${article.content}, ${article.category}, ${vectorString}::vector, NOW(), NOW())
          `
        }
      } catch (err) {
        console.error(`[RAG] Failed to seed article "${article.title}":`, err)
      }
    }
    
    console.log("[RAG] KnowledgeBase seeding completed.")
  }

  /**
   * Generates a contextual prompt for the LLM based on retrieved documents.
   */
  async getContextForQuery(queryText: string): Promise<string> {
    const relevantDocs = await this.query(queryText)
    
    if (relevantDocs.length === 0) {
      return "İlgili döküman bulunamadı."
    }

    return relevantDocs
      .map((d, i) => `[Döküman ${i + 1} - ${d.title}]: ${d.content}`)
      .join("\n\n")
  }
}

export const financialRAG = new FinancialRAG()
