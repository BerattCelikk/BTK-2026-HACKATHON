import { FinancialAnalystAgent } from "../financial-analyst/agent"
import { InvestmentAdvisorAgent } from "../investment-advisor/agent"
import { BudgetOptimizerAgent } from "../budget-optimizer/agent"
import { EducationAgent } from "../education-agent/agent"
import { DebtManagerAgent } from "../debt-manager/agent"
import { WealthAdvisorAgent } from "../wealth-advisor/agent"
import { PortfolioAdvisorAgent } from "../portfolio-advisor/agent"
import { routeToAgent } from "@/lib/agent-router"
import { ConversationMemory } from "@/lib/agent-memory"
import { agentCache } from "@/lib/agent-cache"
import { logAgentInteraction } from "@/lib/agent-analytics"
import { synthesizeResponse } from "@/lib/langgraph"
import prisma from "@/lib/prisma"
import { AgentType, Message } from "@/types"
import { generateId } from "@/lib/utils"

export class OrchestratorAgentV2 {
  private agents: Record<string, any>

  constructor() {
    this.agents = {
      financial_analyst: new FinancialAnalystAgent(),
      investment_advisor: new InvestmentAdvisorAgent(),
      budget_optimizer: new BudgetOptimizerAgent(),
      education_agent: new EducationAgent(),
      debt_manager: new DebtManagerAgent(),
      wealth_advisor: new WealthAdvisorAgent(),
      portfolio_advisor: new PortfolioAdvisorAgent()
    }
  }

  async processQuery(
    query: string,
    userId: string,
    options: {
      forceAgent?: string
      context?: any
      historyLimit?: number
    } = {}
  ) {
    const startTime = Date.now()
    const { forceAgent, context = {}, historyLimit = 5 } = options
    
    // 1. Get User Profile (Cached)
    const cacheKey = `user-profile-${userId}`
    let dbUser = agentCache.get<any>(cacheKey)
    if (!dbUser) {
      dbUser = await prisma.user.findUnique({ 
        where: { clerkId: userId },
        include: { preferences: true }
      })
      if (dbUser) agentCache.set(cacheKey, dbUser, 300 * 1000) // 5 min
    }
    
    const prismaUserId = dbUser?.id || userId

    // 2. Routing
    let agentId: AgentType | "orchestrator" | "wealth_advisor" | "portfolio_advisor" = forceAgent as any
    let confidence = 1.0
    let reasoning = "Manuel seçim"

    if (!forceAgent) {
      const routing = await routeToAgent(query, context)
      agentId = routing.agentId as any
      confidence = routing.confidence
      reasoning = routing.reasoning
    }

    // 3. Memory
    const memory = new ConversationMemory(prismaUserId, agentId)
    const history = await memory.getContext(historyLimit)
    
    // Add user message to memory
    await memory.addMessage("user", query)

    // 4. Execution with Collaboration Logic
    let finalResponse = ""
    const agentsInvolved: AgentType[] = []
    
    try {
      if (agentId === "orchestrator") {
        // Multi-agent synthesis
        const analystResult = await this.agents.financial_analyst.analyzeFinances(query, prismaUserId)
        const budgetResult = await this.agents.budget_optimizer.createBudgetWithTools(query, prismaUserId)
        
        const responses = {
          financial_analyst: analystResult.summary,
          budget_optimizer: budgetResult
        }
        
        finalResponse = await synthesizeResponse(responses, query)
        agentsInvolved.push("financial_analyst", "budget_optimizer")
      } else {
        const agent = this.agents[agentId]
        if (agent) {
          // Check for collaboration
          if (agentId === "financial_analyst" && query.toLowerCase().includes("bütçe")) {
            const budgetOpt = await this.agents.budget_optimizer.createBudgetWithTools(query, prismaUserId)
            finalResponse = await agent.analyzeFinances(query + "\n\nEk Bütçe Bilgisi: " + budgetOpt, prismaUserId).then((r: any) => r.summary)
            agentsInvolved.push("financial_analyst", "budget_optimizer")
          } else if (agentId === "wealth_advisor" && query.toLowerCase().includes("yatırım")) {
             const investAdvice = await this.agents.investment_advisor.generateInvestmentAdvice(context)
             finalResponse = "Varlık planınız yatırım stratejinizle birleştirildi:\n\n" + investAdvice
             agentsInvolved.push("investment_advisor")
          } else {
            // Standard agent call
            switch(agentId) {
              case "financial_analyst":
                finalResponse = (await agent.analyzeFinances(query, prismaUserId)).summary
                break
              case "budget_optimizer":
                finalResponse = await agent.createBudgetWithTools(query, prismaUserId)
                break
              case "investment_advisor":
                finalResponse = await agent.generateInvestmentAdvice(context)
                break
              case "debt_manager":
                finalResponse = await agent.generateDebtAdvice(context)
                break
              case "education_agent":
                finalResponse = await agent.generateLessonSummary(query)
                break
              case "wealth_advisor":
                finalResponse = "Servet projeksiyonunuz ve tasarruf stratejiniz analiz ediliyor."
                break
              case "portfolio_advisor":
                finalResponse = "Portföy dağılımınız ve piyasa fırsatları değerlendiriliyor."
                break
              default:
                finalResponse = "Üzgünüm, bu ajan henüz hazır değil."
            }
            agentsInvolved.push(agentId as AgentType)
          }
        }
      }
      
      // 5. Add assistant response to memory
      await memory.addMessage("assistant", finalResponse, { agentId, confidence })
      
      // 6. Analytics
      await logAgentInteraction({
        userId: prismaUserId,
        agentId,
        responseTime: Date.now() - startTime,
        success: true,
        confidence,
        interactionType: "chat"
      })

      return {
        response: finalResponse,
        agentId,
        confidence,
        reasoning,
        agentsInvolved,
        history
      }

    } catch (error: any) {
      console.error("Orchestrator V2 Error:", error)
      
      await logAgentInteraction({
        userId: prismaUserId,
        agentId,
        responseTime: Date.now() - startTime,
        success: false,
        error: error.message
      })
      
      return {
        response: "Üzgünüm, isteğinizi işlerken bir hata oluştu. Lütfen bütçe verilerinizi kontrol edip tekrar deneyin.",
        agentId,
        error: true
      }
    }
  }
}

export const orchestratorV2 = new OrchestratorAgentV2()
