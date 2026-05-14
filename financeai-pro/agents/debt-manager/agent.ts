export class DebtManagerAgent {
  calculatePayoffPlan(
    debts: {
      name: string
      balance: number
      interestRate: number
      minimumPayment: number
    }[],
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
    const debtBalances = sortedDebts.map((d) => ({
      ...d,
      remaining: d.balance,
    }))

    while (debtBalances.some((d) => d.remaining > 0) && month < 600) {
      month++
      let availablePayment = monthlyPayment
      let monthInterest = 0
      const activeDebts = debtBalances.filter((d) => d.remaining > 0)

      for (let i = 0; i < activeDebts.length; i++) {
        const monthlyRate = activeDebts[i].interestRate / 100 / 12
        const interestCharge = activeDebts[i].remaining * monthlyRate
        activeDebts[i].remaining += interestCharge
        monthInterest += interestCharge
      }

      for (let i = 0; i < activeDebts.length; i++) {
        const minPayment = activeDebts[i].minimumPayment
        const payment = Math.min(minPayment, availablePayment, activeDebts[i].remaining)
        activeDebts[i].remaining -= payment
        availablePayment -= payment
      }

      while (availablePayment > 0 && activeDebts.length > 0) {
        const target = activeDebts.find((d) => d.remaining > 0)
        if (!target) break
        const payment = Math.min(availablePayment, target.remaining)
        target.remaining -= payment
        availablePayment -= payment
      }

      totalInterest += monthInterest
      const remainingBalance = debtBalances.reduce((s, d) => s + Math.max(0, d.remaining), 0)

      if (month <= 12 || month % 12 === 0 || remainingBalance === 0) {
        schedule.push({
          month,
          payment: monthlyPayment,
          remainingBalance: Math.round(remainingBalance),
          interestPaid: Math.round(monthInterest),
        })
      }
    }

    const debtInfo = sortedDebts.map((d) => {
      const target = debtBalances.find((td) => td.name === d.name)
      return {
        name: d.name,
        balance: d.balance,
        interestRate: d.interestRate,
        minimumPayment: d.minimumPayment,
        suggestedPayment: monthlyPayment,
      }
    })

    return {
      debts: debtInfo,
      totalDebt,
      totalInterest: Math.round(totalInterest),
      payoffMonths: month,
      monthlyPayment,
      strategy,
      schedule,
    }
  }

  async generateDebtAdvice(plan: any): Promise<string> {
    const years = Math.floor(plan.payoffMonths / 12)
    const months = plan.payoffMonths % 12
    const timeStr =
      years > 0
        ? `${years} yıl ${months} ay`
        : `${months} ay`

    const strategyName =
      plan.strategy === "snowball" ? "Kartopu Yöntemi" : "Çığ Yöntemi"

    return `**Borç Yönetim Planı**

**Strateji:** ${strategyName}

**Borç Durumu:**
- Toplam Borç: ${plan.totalDebt.toLocaleString("tr-TR")} TL
- Toplam Faiz: ${plan.totalInterest.toLocaleString("tr-TR")} TL
- Aylık Ödeme: ${plan.monthlyPayment.toLocaleString("tr-TR")} TL
- Tahmini Süre: ${timeStr}

**Ödeme Sırası:**
${plan.debts
  .map(
    (d: any, i: number) =>
      `${i + 1}. ${d.name}: ${d.balance.toLocaleString("tr-TR")} TL (%${d.interestRate} faiz)`
  )
  .join("\n")}

**Öneriler:**
1. Her ay düzenli ödeme yapın
2. Ekstra gelirlerinizi borç ödemeye yönlendirin
3. Yeni borçlanmaktan kaçının
4. Mümkünse borç birleştirme seçeneklerini araştırın

**Not:** Bu plan faiz oranlarının sabit kaldığını varsayar. Gerçek hayatta faiz oranları değişebilir.
`
  }
}
