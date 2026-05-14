import { GoogleGenerativeAI } from "@google/generative-ai"

export class DebtManagerAgent {
  private genAI: GoogleGenerativeAI

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
  }

  async analyzeDebtStrategy(debts: { name: string; amount: number; interestRate: number }[]): Promise<string> {
    if (debts.length === 0) return "Tebrikler! Hiç borcunuz yok! 🎉"

    const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
    const debtList = debts.map((d, i) => `${i + 1}. ${d.name}: ${d.amount.toLocaleString("tr-TR")} TL (Faiz: %${d.interestRate})`).join("\n")
    const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0)

    const prompt = `
Borç yönetimi uzmanı olarak, kullanıcının borçlarını en verimli şekilde nasıl ödeyebileceğini analiz et.

BORÇLAR:
${debtList}

TOPLAM BORÇ: ${totalDebt.toLocaleString("tr-TR")} TL

ANALİZ:
1. Snowball Stratejisi (küçükten başla - psikolojik avantaj)
2. Avalanche Stratejisi (yüksek faizden başla - ekonomik avantaj)
3. Her iki strateji için ödeme süresi ve toplam faiz hesapla
4. Hangi stratejinin daha mantıklı olduğunu açıkla

YANIT (Türkçe, kurumsal):
### Borç Durumunuz
[Toplam borç, aylık ödeme kapasitesi]

### Snowball Stratejisi 🟢
- Sıra: [borçlar küçükten büyüğe]
- Tahmini süre: X ay
- Toplam faiz: Y TL
- Avantaj: Psikolojik motivasyon

### Avalanche Stratejisi 🔵
- Sıra: [borçlar yüksek faizden başlayarak]
- Tahmini süre: X ay
- Toplam faiz: Y TL
- Avantaj: Matematiksel olarak daha verimli

### 🎯 Tavsiye
Senin durumuna göre [Snowball/Avalanche] daha uygun çünkü...
`
    const result = await model.generateContent(prompt)
    return result.response.text()
  }

  calculatePayoffPlan(
    debts: { name: string; balance: number; interestRate: number; minimumPayment: number }[],
    extraPayment: number,
    strategy: "snowball" | "avalanche"
  ) {
    const totalDebt = debts.reduce((s, d) => s + d.balance, 0)
    let totalInterest = 0
    const sortedDebts = [...debts]
    if (strategy === "snowball") {
      sortedDebts.sort((a, b) => a.balance - b.balance)
    } else {
      sortedDebts.sort((a, b) => b.interestRate - a.interestRate)
    }
    const totalMinPayment = debts.reduce((s, d) => s + d.minimumPayment, 0)
    const monthlyPayment = totalMinPayment + extraPayment
    const schedule = []
    let month = 0
    const debtBalances = sortedDebts.map((d) => ({ ...d, remaining: d.balance }))
    schedule.push({ month: 0, totalRemaining: totalDebt, debts: debtBalances.map((d) => ({ name: d.name, remaining: d.remaining })) })
    while (debtBalances.some((d) => d.remaining > 1) && month < 600) {
      month++
      let remainingPayment = monthlyPayment
      for (const debt of debtBalances) {
        if (debt.remaining <= 0) continue
        const interest = debt.remaining * (debt.interestRate / 100 / 12)
        debt.remaining += interest
        totalInterest += interest
      }
      for (const debt of debtBalances) {
        if (debt.remaining <= 0) continue
        const payment = Math.min(remainingPayment, debt.remaining)
        debt.remaining -= payment
        remainingPayment -= payment
        if (remainingPayment <= 0) break
      }
      schedule.push({
        month,
        totalRemaining: Math.round(debtBalances.reduce((s, d) => s + d.remaining, 0)),
        debts: debtBalances.map((d) => ({ name: d.name, remaining: Math.round(d.remaining) })),
      })
    }
    return {
      totalDebt,
      totalInterest: Math.round(totalInterest),
      payoffMonths: month,
      monthlyPayment,
      strategy,
      schedule,
    }
  }

  async generateDebtAdvice(plan: any): Promise<string> {
    const strategyName = plan.strategy === "snowball" ? "Kartopu" : "Çığ"
    const months = Math.round(plan.payoffMonths / 12 * 10) / 10
    const yearsText = months >= 12 ? `${Math.floor(months / 12)} yıl ${Math.round(months % 12)} ay` : `${plan.payoffMonths} ay`

    return [
      `**Borç Yönetimi Stratejisi: ${strategyName} Yöntemi**`,
      "",
      `**Seçilen Strateji:** ${strategyName}`,
      `**Toplam Borç:** ${plan.totalDebt.toLocaleString("tr-TR")} TL`,
      `**Toplam Faiz:** ${plan.totalInterest.toLocaleString("tr-TR")} TL`,
      `**Tahmini Süre:** ${yearsText}`,
      `**Aylık Ödeme:** ${plan.monthlyPayment.toLocaleString("tr-TR")} TL`,
      "",
      `**${strategyName} Yöntemi Avantajları:**`,
      strategyName === "Kartopu"
        ? "- Küçük borçları hızlıca kapatarak motivasyon kazanırsınız"
        : "- En yüksek faizli borçtan başlayarak toplam faizi minimize edersiniz",
      "",
      `**Ödeme Planı:**`,
      ...plan.schedule
        .filter((_: any, i: number) => i % Math.max(1, Math.floor(plan.schedule.length / 6)) === 0 || i === plan.schedule.length - 1)
        .map((s: any) => `- Ay ${s.month}: Kalan borç ${s.totalRemaining.toLocaleString("tr-TR")} TL`),
      "",
      "💡 **İpucu:** Düzenli ek ödeme yaparak borcunuzu daha hızlı kapatabilirsiniz.",
    ].join("\n")
  }
}
