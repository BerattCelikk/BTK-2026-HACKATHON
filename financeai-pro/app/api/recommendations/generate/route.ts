import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { analyzeSpendingPatterns } from "@/lib/spending-insights"
import { suggestFinancialGoals } from "@/lib/goal-suggester"
import { recommendInvestments } from "@/lib/investment-recommender"
import { checkRebalancingNeeded } from "@/lib/rebalancing-alerts"
import { optimizeSpending } from "@/lib/spending-optimizer"
import { RecommendationsAdvisor } from "@/agents/recommendations-advisor/agent"
import { agentCache } from "@/lib/agent-cache"

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const cacheKey = `recommendations-${user.id}`
    const cached = agentCache.get<any>(cacheKey)
    if (cached) return NextResponse.json(cached)

    const [
      spendingInsights,
      suggestedGoals,
      investmentAllocation,
      rebalancingAlerts,
      spendingOptimizations
    ] = await Promise.all([
      analyzeSpendingPatterns(user.id),
      suggestFinancialGoals(user.id),
      recommendInvestments(user.id),
      checkRebalancingNeeded(user.id),
      optimizeSpending(user.id)
    ])

    const advisor = new RecommendationsAdvisor()
    const aiAdvice = await advisor.generatePersonalizedAdvice(user.id, {
      spendingInsights,
      suggestedGoals,
      investmentAllocation,
      rebalancingAlerts,
      spendingOptimizations
    })

    const result = {
      spendingInsights,
      suggestedGoals,
      investmentAllocation,
      rebalancingAlerts,
      spendingOptimizations,
      aiAdvice,
      generatedAt: new Date().toISOString()
    }

    // Cache for 24 hours
    agentCache.set(cacheKey, result, 24 * 60 * 60 * 1000)

    return NextResponse.json(result)

  } catch (error) {
    console.error("Generate Recommendations error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
