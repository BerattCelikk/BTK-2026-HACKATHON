import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// In-memory cache to avoid duplicate embedding calls
const embeddingCache = new Map<string, number[]>();

/**
 * Generates an embedding for the given text using Gemini.
 * Returns a 384-dimensional vector.
 */
export async function embedText(text: string): Promise<number[]> {
  if (!text) return [];

  // Check cache first
  if (embeddingCache.has(text)) {
    return embeddingCache.get(text)!;
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing in environment variables");
  }

  try {
    // Using text-embedding-004 as it supports variable dimensions
    // If you specifically need embedding-001, it returns 768 dims and would need truncation
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    
    console.log(`[Embedding] Generating embedding for text (${text.length} chars)...`);
    
    const result = await model.embedContent({
      content: { parts: [{ text }] },
      outputDimensionality: 384,
    });

    const embedding = result.embedding.values;

    if (embedding.length !== 384) {
      console.warn(`[Embedding] Expected 384 dimensions, but got ${embedding.length}. Truncating or padding.`);
      if (embedding.length > 384) {
        return embedding.slice(0, 384);
      } else {
        return [...embedding, ...new Array(384 - embedding.length).fill(0)];
      }
    }

    // Cache the result
    embeddingCache.set(text, embedding);
    
    return embedding;
  } catch (error) {
    console.error("[Embedding] Error generating embedding:", error);
    throw error;
  }
}
