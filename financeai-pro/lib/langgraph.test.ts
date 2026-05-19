import { describe, it, expect, vi } from 'vitest'
import { classifyIntent } from '@/lib/langgraph'

// Mock the LLM to avoid API calls during tests
vi.mock('@langchain/google-genai', () => ({
  ChatGoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    invoke: vi.fn(),
  })),
}))

vi.mock('@langchain/core/runnables', () => ({
  RunnableSequence: {
    from: vi.fn().mockReturnValue({
      invoke: vi.fn().mockResolvedValue('investment_advice')
    })
  }
}))

describe('Intent Classification', () => {
  it('should correctly classify investment queries', async () => {
    const intent = await classifyIntent('Hisse senedi almalı mıyım?')
    expect(intent).toBe('investment_advice')
  })

  it('should handle general greetings', async () => {
    // Override mock for this specific test
    const { RunnableSequence } = await import('@langchain/core/runnables')
    vi.mocked(RunnableSequence.from({} as any).invoke).mockResolvedValueOnce('general_query')
    
    const intent = await classifyIntent('Merhaba, nasılsın?')
    expect(intent).toBe('general_query')
  })
})
