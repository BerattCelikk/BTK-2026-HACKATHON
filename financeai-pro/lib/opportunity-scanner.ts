import { OpportunitySignal } from "@/types/analytics"

export async function scanOpportunities(userId: string, riskTolerance: string): Promise<OpportunitySignal[]> {
  // In a real app, this would fetch live market data from APIs
  // For this hackathon, we simulate signals based on common market conditions
  
  const opportunities: OpportunitySignal[] = [
    {
      asset: "BIST100",
      signal: "BUY",
      confidence: 0.85,
      expectedReturn: 25,
      risk: 6,
      reason: "BIST100 endeksi 200 günlük hareketli ortalamasının üzerinde ve aşırı satım bölgesinden (RSI < 30) çıkış gösteriyor.",
      technicalIndicators: { rsi: 35, macd: "Bullish Crossover" }
    },
    {
      asset: "BTC/USD",
      signal: "HOLD",
      confidence: 0.65,
      expectedReturn: 40,
      risk: 9,
      reason: "Bitcoin kritik direnç seviyelerinde konsolide oluyor. Yeni bir trend için hacimli kırılım beklenmeli.",
      technicalIndicators: { rsi: 58, macd: "Neutral" }
    },
    {
      asset: "Gram Altın",
      signal: "BUY",
      confidence: 0.75,
      expectedReturn: 15,
      risk: 3,
      reason: "Küresel belirsizlikler ve merkez bankası alımları nedeniyle güvenli liman talebi artış eğiliminde.",
      technicalIndicators: { rsi: 45, macd: "Positive" }
    },
    {
      asset: "USD/TRY",
      signal: "HOLD",
      confidence: 0.90,
      expectedReturn: 10,
      risk: 4,
      reason: "Döviz kurları yatay seyir izliyor. Enflasyon verileri takip edilmeli.",
      technicalIndicators: { rsi: 50, macd: "Stable" }
    }
  ]

  // Filter based on risk tolerance if high
  if (riskTolerance === "conservative") {
    return opportunities.filter(o => o.risk <= 5)
  }

  return opportunities
}
