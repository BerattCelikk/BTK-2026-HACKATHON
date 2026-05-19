import prisma from "./prisma"
import { FinancialMetrics, FinancialMetricResult } from "@/types/analytics"

export async function calculateFinancialMetrics(userId: string): Promise<FinancialMetrics> {
  const [user, transactions, investments, debts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.transaction.findMany({ where: { userId } }),
    prisma.investment.findMany({ where: { userId } }),
    prisma.debt.findMany({ where: { userId } })
  ])

  const totalExpenses = transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0)
  const totalIncome = transactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0)
  const totalDebt = debts.reduce((sum, d) => sum + d.remainingAmount, 0)
  const totalSavings = investments.reduce((sum, i) => sum + i.currentValue, 0)

  // 1. Debt-to-Income
  const dti = totalIncome > 0 ? (totalDebt / (totalIncome * 12)) * 100 : 0
  const debtToIncome: FinancialMetricResult = {
    value: dti,
    trend: "stable", // Would need history for real trend
    healthy: dti < 36
  }

  // 2. Savings Rate
  const sRate = totalIncome > 0 ? ((totalIncome - (totalExpenses / 12)) / totalIncome) * 100 : 0
  const savingsRate: FinancialMetricResult = {
    value: sRate,
    trend: "improving",
    healthy: sRate > 20
  }

  // 3. Emergency Fund Coverage (Months)
  const avgMonthlyExpense = transactions.length > 0 ? (totalExpenses / (transactions.length / 30)) : 1
  const efMonths = totalSavings / (avgMonthlyExpense || 1)
  const emergencyFundMonths: FinancialMetricResult = {
    value: efMonths,
    trend: "stable",
    healthy: efMonths >= 6
  }

  // 4. Sharpe Ratio (Simplified)
  // (Return - Risk Free) / Volatility
  const sharpeRatio: FinancialMetricResult = {
    value: 1.25, // Mocked for hackathon
    trend: "stable",
    healthy: true
  }

  // 5. Investment Return Rate
  const investmentReturnRate: FinancialMetricResult = {
    value: 18.5, // Mocked
    trend: "improving",
    healthy: true
  }

  return {
    sharpeRatio,
    debtToIncome,
    emergencyFundMonths,
    savingsRate,
    investmentReturnRate
  }
}
