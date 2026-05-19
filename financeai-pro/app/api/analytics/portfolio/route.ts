import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"
import { analyzePortfolio } from "@/lib/portfolio-analyzer"
import { suggestTaxStrategies } from "@/lib/tax-optimizer"
import { scanOpportunities } from "@/lib/opportunity-scanner"
import { PortfolioAdvisorAgent } from "@/agents/portfolio-advisor/agent"

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { clerkId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    const [portfolio, taxStrategies, opportunities] = await Promise.all([
      analyzePortfolio(user.id),
      suggestTaxStrategies(user.id, user.monthlyIncome ? user.monthlyIncome * 12 : 360000),
      scanOpportunities(user.id, user.riskProfile || "moderate")
    ])

    const agent = new PortfolioAdvisorAgent()
    const aiRecommendations = await agent.generateRecommendations(portfolio, taxStrategies, opportunities)

    return NextResponse.json({
      portfolio,
      taxStrategies,
      opportunities,
      aiRecommendations
    })
  } catch (error) {
    console.error("Portfolio Analytics API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
