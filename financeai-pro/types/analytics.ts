export interface PortfolioAnalysis {
  totalWealth: number
  composition: {
    stocks: number // %
    bonds: number
    crypto: number
    cash: number
    gold: number
  }
  concentration: "low" | "medium" | "high"
  riskAssessment: string
  recommendations: string[]
  rebalanceActions: Array<{
    asset: string
    currentPercent: number
    targetPercent: number
    action: "buy" | "sell"
  }>
}

export interface TaxStrategy {
  strategy: string
  savingsPotential: number // TRY
  riskLevel: "low" | "medium" | "high"
  description: string
  estimatedTaxSavings: number
}

export interface OpportunitySignal {
  asset: string
  signal: "BUY" | "HOLD" | "SELL"
  confidence: number // 0-1
  expectedReturn: number // %
  risk: number // 0-10
  reason: string
  technicalIndicators: {
    rsi?: number
    macd?: string
  }
}

export interface FinancialMetricResult {
  value: number
  trend: "improving" | "declining" | "stable"
  healthy: boolean
}

export interface FinancialMetrics {
  sharpeRatio: FinancialMetricResult
  debtToIncome: FinancialMetricResult
  emergencyFundMonths: FinancialMetricResult
  savingsRate: FinancialMetricResult
  investmentReturnRate: FinancialMetricResult
}

export interface PeerComparison {
  metric: string
  userValue: number
  peerAverage: number
  percentile: number // 0-100
  benchmark: string // "You are in top 25%"
}
