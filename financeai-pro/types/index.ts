export interface AgentState {
  userQuery: string
  intent: AgentIntent
  userId: string
  context: Record<string, unknown>
  currentAgent: AgentType | null
  finalResponse: string | null
  agentResponses: Partial<Record<AgentType, unknown>>
  error?: string
  conversationHistory: Message[]
}

export type AgentType =
  | "financial_analyst"
  | "investment_advisor"
  | "budget_optimizer"
  | "education_agent"
  | "debt_manager"
  | "orchestrator"

export type AgentIntent =
  | "analyze_finances"
  | "investment_advice"
  | "budget_planning"
  | "financial_education"
  | "debt_management"
  | "general_query"
  | "multi_agent"

export interface Message {
  id: string
  role: "user" | "assistant" | "system" | "agent"
  content: string
  agentType?: AgentType
  timestamp: Date
  metadata?: Record<string, unknown>
}

export interface ExpenseCategory {
  name: string
  amount: number
  percentage: number
  transactions: number
}

export interface FinancialAnalysis {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
  expenseBreakdown: ExpenseCategory[]
  insights: string[]
  recommendations: string[]
  riskAreas: string[]
  cashFlowStatus: "positive" | "negative" | "neutral"
}

export interface InvestmentRecommendation {
  assetClass: string
  allocation: number
  rationale: string
  riskLevel: string
  expectedReturn: string
}

export interface BudgetPlan {
  categories: BudgetCategory[]
  totalBudget: number
  totalSpent: number
  remainingBudget: number
  optimizationTips: string[]
  savingsOpportunities: SavingsOpportunity[]
}

export interface BudgetCategory {
  name: string
  planned: number
  actual: number
  variance: number
  status: "under" | "over" | "on_track"
}

export interface SavingsOpportunity {
  area: string
  currentSpending: number
  potentialSavings: number
  suggestion: string
}

export interface DebtPayoffPlan {
  debts: DebtInfo[]
  totalDebt: number
  totalInterest: number
  payoffMonths: number
  monthlyPayment: number
  strategy: "snowball" | "avalanche"
  schedule: PaymentSchedule[]
}

export interface DebtInfo {
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
  suggestedPayment: number
}

export interface PaymentSchedule {
  month: number
  payment: number
  remainingBalance: number
  interestPaid: number
}

export interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface Lesson {
  id: string
  title: string
  topic: string
  content: string
  difficulty: "beginner" | "intermediate" | "advanced"
  duration: string
  quiz: QuizQuestion[]
}

export interface PortfolioSimulation {
  initialInvestment: number
  monthlyContribution: number
  riskProfile: RiskProfile
  timeHorizon: number
  projectedValues: ProjectedValue[]
  assetAllocation: AssetAllocation[]
}

export interface ProjectedValue {
  year: number
  conservative: number
  moderate: number
  aggressive: number
}

export interface AssetAllocation {
  asset: string
  percentage: number
  amount: number
}

export interface AnomalyResult {
  type: "spike" | "duplicate" | "unusual"
  severity: "high" | "medium" | "low"
  category: string
  amount: number
  description: string
  suggestion: string
}

export type RiskProfile = "conservative" | "moderate" | "aggressive" | "very_aggressive"
