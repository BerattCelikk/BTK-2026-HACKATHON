import prisma from "./prisma"

export interface AgentInteraction {
  userId: string
  agentId: string
  responseTime: number
  success: boolean
  confidence?: number
  error?: string
  interactionType?: "chat" | "tool_call"
}

export async function logAgentInteraction(data: AgentInteraction) {
  try {
    await prisma.agentAnalytics.create({
      data: {
        userId: data.userId,
        agentId: data.agentId,
        responseTime: data.responseTime,
        success: data.success,
        confidence: data.confidence,
        error: data.error,
        interactionType: data.interactionType || "chat"
      }
    })
  } catch (error) {
    console.error("Error logging agent interaction:", error)
  }
}

export async function getAgentMetrics(agentId: string, periodDays: number = 7) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - periodDays)

  const analytics = await prisma.agentAnalytics.findMany({
    where: {
      agentId,
      timestamp: { gte: startDate }
    }
  })

  if (analytics.length === 0) {
    return {
      successRate: 0,
      avgResponseTime: 0,
      count: 0,
      avgConfidence: 0
    }
  }

  const successCount = analytics.filter(a => a.success).length
  const totalResponseTime = analytics.reduce((sum, a) => sum + a.responseTime, 0)
  const totalConfidence = analytics.reduce((sum, a) => sum + (a.confidence || 0), 0)

  return {
    successRate: successCount / analytics.length,
    avgResponseTime: totalResponseTime / analytics.length,
    count: analytics.length,
    avgConfidence: totalConfidence / analytics.length
  }
}
