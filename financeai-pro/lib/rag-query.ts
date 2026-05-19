import { embedText } from "./embedding"
import prisma from "./prisma"

/**
 * Semantic search in the knowledge base
 * Returns most relevant articles based on query similarity
 */
export async function semanticSearch(
  query: string,
  topK: number = 3
): Promise<Array<{ title: string; content: string; category: string; similarity: number }>> {
  try {
    if (!query || query.trim().length === 0) {
      console.warn("[RAG] Empty query provided")
      return []
    }

    // Embed the user's query
    const queryEmbedding = await embedText(query)
    const vectorString = `[${queryEmbedding.join(",")}]`

    // Find K nearest neighbors using pgvector
    // Lower distance = higher similarity
    const results = await prisma.$queryRaw<any[]>`
      SELECT 
        id,
        title, 
        content, 
        category,
        1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM "KnowledgeBase"
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${topK}
    `

    return results.map((r) => ({
      title: r.title,
      content: r.content,
      category: r.category,
      similarity: parseFloat(r.similarity) || 0,
    }))
  } catch (error) {
    console.error("[RAG] Semantic search error:", error)
    return []
  }
}

/**
 * Generate context from RAG results for LLM
 * Formats search results as readable text for the model
 */
export async function generateRAGContext(query: string): Promise<string> {
  try {
    const results = await semanticSearch(query, 3)

    if (results.length === 0) {
      return "Knowledge base bulunamadı. Genel finansal bilgilerini kullan."
    }

    let context = "İlgili Bilgiler:\n"
    results.forEach((result, i) => {
      context += `\n${i + 1}. **${result.title}** (${result.category})\n`
      context += `   İçerik: ${result.content.substring(0, 200)}...\n`
      context += `   Benzerlik: %${Math.round(result.similarity * 100)}\n`
    })

    return context
  } catch (error) {
    console.error("[RAG] Error generating context:", error)
    return ""
  }
}

/**
 * Query the knowledge base and get LLM response with context
 */
export async function queryWithRAGContext(query: string): Promise<string> {
  const ragContext = await generateRAGContext(query)
  
  // Return formatted context for agent to use
  return `Sorgu: ${query}\n\n${ragContext}`
}

/**
 * Check if knowledge base has been seeded
 */
export async function isKnowledgeBasePopulated(): Promise<boolean> {
  try {
    const count = await prisma.knowledgeBase.count()
    return count > 0
  } catch {
    return false
  }
}

export { semanticSearch as ragSearch }
