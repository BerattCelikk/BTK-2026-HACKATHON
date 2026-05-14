import { ChatGoogleGenerativeAI } from "@langchain/google-genai"
import { RunnableSequence } from "@langchain/core/runnables"
import { PromptTemplate } from "@langchain/core/prompts"
import { StringOutputParser } from "@langchain/core/output_parsers"

let llmInstance: ChatGoogleGenerativeAI | null = null

function getLLM(): ChatGoogleGenerativeAI {
  if (!llmInstance) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set")
    }
    llmInstance = new ChatGoogleGenerativeAI({
      model: "gemini-pro",
      apiKey,
      temperature: 0.7,
      maxOutputTokens: 2048,
    })
  }
  return llmInstance
}

function createChain(
  template: string
): RunnableSequence {
  const prompt = PromptTemplate.fromTemplate(template)
  return RunnableSequence.from([prompt, getLLM(), new StringOutputParser()])
}

export async function classifyIntent(query: string): Promise<string> {
  const template = `
You are a financial intent classifier. Analyze the user's query and determine the most appropriate financial agent to handle it.

User Query: {query}

Choose ONE of these intents:
- analyze_finances: For analyzing financial situation, income, expenses, cash flow
- investment_advice: For investment recommendations, portfolio, stocks, market analysis
- budget_planning: For budget creation, spending analysis, savings planning
- financial_education: For learning financial concepts, lessons, quizzes
- debt_management: For debt payoff strategies, consolidation, loan management
- general_query: For general financial questions or greetings
- multi_agent: For complex queries that need multiple agents

Respond with ONLY the intent name, nothing else.
`

  const chain = createChain(template)
  const result = await chain.invoke({ query })
  return result.trim().toLowerCase()
}

export async function synthesizeResponse(
  agentResponses: Record<string, string>,
  originalQuery: string
): Promise<string> {
  const template = `
You are a financial advisor synthesizing responses from multiple specialized agents.

Original User Query: {query}

Agent Responses:
{responses}

Create a cohesive, helpful response that:
1. Summarizes the key insights from all agents
2. Provides actionable recommendations
3. Uses clear, simple language in Turkish
4. Highlights the most important information first

Response:
`

  const responsesText = Object.entries(agentResponses)
    .map(([agent, response]) => `[${agent}]: ${response}`)
    .join("\n\n")

  const chain = createChain(template)
  return chain.invoke({ query: originalQuery, responses: responsesText })
}
