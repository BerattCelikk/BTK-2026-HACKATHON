export async function useGeminiChat(messages: { role: string; content: string }[]) {
  try {
    const response = await fetch("/api/gemini/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
    })

    if (!response.ok) throw new Error("API request failed")

    const data = await response.json()
    return data.text
  } catch (error) {
    console.error("Gemini chat error:", error)
    throw error
  }
}
