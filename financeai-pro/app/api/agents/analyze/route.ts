import { NextRequest, NextResponse } from "next/server"
import { FinancialAnalystAgent } from "@/agents/financial-analyst/agent"
import { InvestmentAdvisorAgent } from "@/agents/investment-advisor/agent"
import { BudgetOptimizerAgent } from "@/agents/budget-optimizer/agent"
import { DebtManagerAgent } from "@/agents/debt-manager/agent"
import { generateContent } from "@/lib/gemini"
import { financialRAG } from "@/lib/rag"

const financialAnalyst = new FinancialAnalystAgent()
const investmentAdvisor = new InvestmentAdvisorAgent()
const budgetOptimizer = new BudgetOptimizerAgent()
const debtManager = new DebtManagerAgent()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case "analyze": {
        const result = await financialAnalyst.analyzeFinances(data)
        return NextResponse.json(result)
      }

      case "invest": {
        const { riskProfile, amount, timeHorizon, goals } = data
        const simulation = investmentAdvisor.simulatePortfolio(
          amount || 10000,
          data.monthlyContribution || 1000,
          riskProfile || "moderate",
          timeHorizon || 5
        )
        const advice = await investmentAdvisor.generateInvestmentAdvice(
          { riskProfile: riskProfile || "moderate", amount: amount || 10000, timeHorizon: timeHorizon || 5, goals: goals || [] },
          simulation
        )
        return NextResponse.json({ simulation, advice })
      }

      case "budget": {
        const result = await budgetOptimizer.createBudget(
          data.income || 0,
          data.expenses || [],
          data.goals || []
        )
        return NextResponse.json(result)
      }

      case "debt": {
        const result = debtManager.calculatePayoffPlan(
          data.debts || [],
          data.extraPayment || 0,
          data.strategy || "snowball"
        )
        const advice = await debtManager.generateDebtAdvice(result)
        return NextResponse.json({ plan: result, advice })
      }

      case "rag-query": {
        const ragPrompt = await financialRAG.generateContextualAnswer(
          data.query,
          null
        )
        const response = await generateContent(ragPrompt, {
          temperature: 0.3,
          maxOutputTokens: 1024,
        })
        return NextResponse.json({ response: response.text })
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Agent analyze error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
