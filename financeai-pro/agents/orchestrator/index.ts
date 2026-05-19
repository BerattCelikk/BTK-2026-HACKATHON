import { FinancialAnalystAgent } from "../financial-analyst/agent"
import { InvestmentAdvisorAgent } from "../investment-advisor/agent"
import { BudgetOptimizerAgent } from "../budget-optimizer/agent"
import { EducationAgent } from "../education-agent/agent"
import { DebtManagerAgent } from "../debt-manager/agent"
import { classifyIntent, synthesizeResponse } from "@/lib/langgraph"
import { generateContent } from "@/lib/gemini"
import { financialRAG } from "@/lib/rag"
import prisma from "@/lib/prisma"
import type { AgentType, AgentIntent, Message } from "@/types"
import { generateId } from "@/lib/utils"

export class OrchestratorAgent {
  private financialAnalyst: FinancialAnalystAgent
  private investmentAdvisor: InvestmentAdvisorAgent
  private budgetOptimizer: BudgetOptimizerAgent
  private educationAgent: EducationAgent
  private debtManager: DebtManagerAgent

  constructor() {
    this.financialAnalyst = new FinancialAnalystAgent()
    this.investmentAdvisor = new InvestmentAdvisorAgent()
    this.budgetOptimizer = new BudgetOptimizerAgent()
    this.educationAgent = new EducationAgent()
    this.debtManager = new DebtManagerAgent()
  }

  async processQuery(
    query: string,
    userId: string,
    context: Record<string, unknown> = {},
    history: Message[] = []
  ): Promise<{
    messages: Message[]
    finalResponse: string
    agentsInvolved: AgentType[]
  }> {
    const intent: AgentIntent = await classifyIntent(query)
    const agentsInvolved: AgentType[] = []
    const responses: Record<string, string> = {}

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: query,
      timestamp: new Date(),
    }

    const agentMessages: Message[] = [userMessage]

    const dbUser = userId !== "anonymous"
      ? await prisma.user.findUnique({ where: { clerkId: userId } })
      : null
    const prismaUserId = dbUser?.id || userId

    switch (intent) {
      case "analyze_finances": {
        const { summary } = await this.financialAnalyst.analyzeFinances(query, prismaUserId)
        agentsInvolved.push("financial_analyst")
        responses["financial_analyst"] = summary

        agentMessages.push({
          id: generateId(),
          role: "agent",
          content: summary,
          agentType: "financial_analyst",
          timestamp: new Date(),
        })
        break
      }

      case "investment_advice": {
        const riskProfile = (context.riskProfile as string) || "moderate"
        const amount = (context.amount as number) || 10000
        const timeHorizon = (context.timeHorizon as number) || 5
        const goals = (context.goals as string[]) || []

        const simulation = this.investmentAdvisor.simulatePortfolio(
          amount,
          (context.monthlyContribution as number) || 1000,
          riskProfile,
          timeHorizon
        )
        const advice = await this.investmentAdvisor.generateInvestmentAdvice(
          { riskProfile, amount, timeHorizon, goals },
          simulation
        )
        agentsInvolved.push("investment_advisor")
        responses["investment_advisor"] = advice

        agentMessages.push({
          id: generateId(),
          role: "agent",
          content: advice,
          agentType: "investment_advisor",
          timestamp: new Date(),
          metadata: { simulation },
        })
        break
      }

      case "budget_planning": {
        const summary = await this.budgetOptimizer.createBudgetWithTools(query, prismaUserId)
        agentsInvolved.push("budget_optimizer")
        responses["budget_optimizer"] = summary

        agentMessages.push({
          id: generateId(),
          role: "agent",
          content: summary,
          agentType: "budget_optimizer",
          timestamp: new Date(),
        })
        break
      }

      case "financial_education": {
        const topicMatch = query.match(/(bütçe|tasarruf|yatırım|borç|kredi|vergi|enflasyon)/i)
        const topic = topicMatch ? this.mapTurkishTopic(topicMatch[1]) : "genel"
        const summary = await this.educationAgent.generateLessonSummary(topic)
        agentsInvolved.push("education_agent")
        responses["education_agent"] = summary

        agentMessages.push({
          id: generateId(),
          role: "agent",
          content: summary,
          agentType: "education_agent",
          timestamp: new Date(),
        })
        break
      }

      case "debt_management": {
        const debts = (context.debts as any[]) || []
        const extraPayment = (context.extraPayment as number) || 0
        const strategy = (context.strategy as "snowball" | "avalanche") || "snowball"

        const plan = this.debtManager.calculatePayoffPlan(debts, extraPayment, strategy)
        const advice = await this.debtManager.generateDebtAdvice(plan)
        agentsInvolved.push("debt_manager")
        responses["debt_manager"] = advice

        agentMessages.push({
          id: generateId(),
          role: "agent",
          content: advice,
          agentType: "debt_manager",
          timestamp: new Date(),
        })
        break
      }

      case "multi_agent": {
        const { analysis, summary: analysisSummary } = await this.financialAnalyst.analyzeFinances(query, prismaUserId)
        agentsInvolved.push("financial_analyst")
        responses["financial_analyst"] = analysisSummary

        const budgetSummary = await this.budgetOptimizer.createBudgetWithTools(query, prismaUserId)
        agentsInvolved.push("budget_optimizer")
        responses["budget_optimizer"] = budgetSummary

        const synthesized = await synthesizeResponse(responses, query)

        agentMessages.push(
          {
            id: generateId(),
            role: "agent",
            content: analysisSummary,
            agentType: "financial_analyst",
            timestamp: new Date(),
          },
          {
            id: generateId(),
            role: "agent",
            content: budgetSummary,
            agentType: "budget_optimizer",
            timestamp: new Date(),
          },
          {
            id: generateId(),
            role: "agent",
            content: synthesized,
            agentType: "orchestrator",
            timestamp: new Date(),
          }
        )
        responses["orchestrator"] = synthesized
        break
      }
    }

    if (intent === "general_query" || !responses[agentsInvolved[0] || ""]) {
      const ragPrompt = await financialRAG.generateContextualAnswer(query)
      const geminiResponse = await generateContent(ragPrompt, {
        temperature: 0.7,
      })

      agentMessages.push({
        id: generateId(),
        role: "assistant",
        content: geminiResponse.text,
        timestamp: new Date(),
      })
      responses["general"] = geminiResponse.text
    }

    const finalResponse =
      responses[agentsInvolved[agentsInvolved.length - 1] || ""] ||
      responses["general"] ||
      "Üzgünüm, talebinizi işleyemedim. Lütfen tekrar deneyin."

    return {
      messages: agentMessages,
      finalResponse,
      agentsInvolved,
    }
  }

  private mapTurkishTopic(turkishWord: string): string {
    const map: Record<string, string> = {
      bütçe: "Bütçe",
      tasarruf: "Tasarruf",
      yatırım: "Yatırım",
      borç: "Borç",
      kredi: "Borç",
      vergi: "Yatırım",
      enflasyon: "Yatırım",
    }
    return map[turkishWord.toLowerCase()] || "genel"
  }
}

export const orchestrator = new OrchestratorAgent()
