import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai"

let genAI: GoogleGenerativeAI | null = null
let model: GenerativeModel | null = null

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured")
    }
    genAI = new GoogleGenerativeAI(apiKey)
  }
  return genAI
}

export function getModel(modelName = "gemini-pro"): GenerativeModel {
  if (!model) {
    const client = getClient()
    model = client.getGenerativeModel({ model: modelName })
  }
  return model
}

export interface GeminiResponse {
  text: string
  raw: string
}

export async function generateContent(
  prompt: string,
  options?: {
    modelName?: string
    temperature?: number
    maxOutputTokens?: number
  }
): Promise<GeminiResponse> {
  const m = getModel(options?.modelName)

  const result = await m.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: options?.temperature ?? 0.7,
      maxOutputTokens: options?.maxOutputTokens ?? 2048,
    },
  })

  const response = result.response
  const text = response.text()

  return { text, raw: text }
}

export async function embedContent(text: string): Promise<number[]> {
  const client = getClient()
  const embeddingModel = client.getGenerativeModel({ model: "text-embedding-004" })
  const result = await embeddingModel.embedContent(text)
  return result.embedding.values
}

export async function generateChatResponse(
  messages: { role: "user" | "model"; content: string }[],
  systemPrompt?: string
): Promise<GeminiResponse> {
  const m = getModel()

  const contents = messages.map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.content }],
  }))

  if (systemPrompt) {
    contents.unshift({
      role: "user",
      parts: [{ text: `System: ${systemPrompt}\n\nUser: ${messages[0]?.content ?? ""}` }],
    })
  }

  const result = await m.generateContent({
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  })

  const response = result.response
  const text = response.text()

  return { text, raw: text }
}

export function extractJsonFromResponse(text: string): Record<string, unknown> {
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[0]) as Record<string, unknown>
    } catch {
      try {
        const cleaned = jsonMatch[0].replace(/(\w+):/g, '"$1":')
        return JSON.parse(cleaned) as Record<string, unknown>
      } catch {
        return { raw: text }
      }
    }
  }
  return { raw: text }
}
