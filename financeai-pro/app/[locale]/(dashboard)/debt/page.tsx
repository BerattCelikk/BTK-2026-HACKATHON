"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DebtPayoffChart } from "@/components/charts"
import {
  CreditCard, TrendingDown, PiggyBank, Calculator,
  Plus, Trash2, Clock, Percent, Banknote, ArrowRight, Zap, Target
} from "lucide-react"

interface DebtInput {
  id: string
  name: string
  balance: number
  interestRate: number
  minimumPayment: number
}

const defaultDebts: DebtInput[] = [
  { id: "1", name: "Kredi Kartı", balance: 15000, interestRate: 24, minimumPayment: 1000 },
  { id: "2", name: "İhtiyaç Kredisi", balance: 30000, interestRate: 18, minimumPayment: 2000 },
  { id: "3", name: "Öğrenim Kredisi", balance: 10000, interestRate: 12, minimumPayment: 500 },
]

function calculatePayoffPlan(debts: DebtInput[], extraPayment: number, strategy: "snowball" | "avalanche") {
  const sorted = debts
    .map((d) => ({ ...d }))
    .sort((a, b) =>
      strategy === "snowball" ? a.balance - b.balance : b.interestRate - a.interestRate
    )

  const monthlyRates = sorted.map((d) => d.interestRate / 100 / 12)
  let balances = sorted.map((d) => d.balance)
  const minPayments = sorted.map((d) => d.minimumPayment)
  let totalInterest = 0
  let month = 0
  const totalMinPayment = minPayments.reduce((s, p) => s + p, 0)
  const totalMonthlyPayment = totalMinPayment + extraPayment
  const schedule: { month: number; remainingBalance: number }[] = []
  const totalDebt = balances.reduce((s, b) => s + b, 0)
  schedule.push({ month: 0, remainingBalance: totalDebt })

  while (balances.some((b) => b > 1) && month < 600) {
    month++
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] > 0) {
        const interest = balances[i] * monthlyRates[i]
        balances[i] += interest
        totalInterest += interest
      }
    }
    let remaining = totalMonthlyPayment
    for (let i = 0; i < balances.length; i++) {
      if (balances[i] <= 0) continue
      const payment = Math.min(remaining, balances[i])
      balances[i] -= payment
      remaining -= payment
      if (remaining <= 0) break
    }
    const totalRemaining = balances.reduce((s, b) => s + b, 0)
    schedule.push({ month, remainingBalance: Math.round(totalRemaining) })
  }

  return {
    schedule,
    totalInterest: Math.round(totalInterest),
    payoffMonths: month,
    totalDebt,
  }
}

function formatTL(amount: number) {
  return amount.toLocaleString("tr-TR") + " TL"
}

export default function DebtPage() {
  const [strategy, setStrategy] = useState<"snowball" | "avalanche">("snowball")
  const [extraPayment, setExtraPayment] = useState(2000)
  const [debts, setDebts] = useState<DebtInput[]>(defaultDebts)
  const [showForm, setShowForm] = useState(false)
  const [newDebt, setNewDebt] = useState<DebtInput>({
    id: "", name: "", balance: 0, interestRate: 0, minimumPayment: 0,
  })

  const plan = useMemo(() => calculatePayoffPlan(debts, extraPayment, strategy), [debts, extraPayment, strategy])

  const addDebt = () => {
    if (!newDebt.name || newDebt.balance <= 0) return
    setDebts((prev) => [...prev, { ...newDebt, id: crypto.randomUUID() }])
    setNewDebt({ id: "", name: "", balance: 0, interestRate: 0, minimumPayment: 0 })
    setShowForm(false)
  }

  const removeDebt = (id: string) => setDebts((prev) => prev.filter((d) => d.id !== id))

  const snowballPlan = useMemo(() => calculatePayoffPlan(debts, extraPayment, "snowball"), [debts, extraPayment])
  const avalanchePlan = useMemo(() => calculatePayoffPlan(debts, extraPayment, "avalanche"), [debts, extraPayment])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Borç Yönetimi</h1>
        <p className="text-gray-400 mt-1">AI destekli borç ödeme stratejileri ile karşılaştırmalı analiz</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-emerald-400" />
                  Borç Hesaplayıcı
                </CardTitle>
                <CardDescription>Borçlarınızı yönetin ve stratejileri karşılaştırın</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(!showForm)}
                className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 gap-1"
              >
                <Plus className="h-4 w-4" />
                Borç Ekle
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {showForm && (
                <Card className="border border-cyan-500/20 bg-gray-800/40">
                  <CardContent className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="Borç adı"
                        value={newDebt.name}
                        onChange={(e) => setNewDebt((p) => ({ ...p, name: e.target.value }))}
                        className="bg-gray-900/60 border-cyan-500/20 text-white col-span-2"
                      />
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Bakiye (TL)</label>
                        <Input
                          type="number"
                          placeholder="15000"
                          value={newDebt.balance || ""}
                          onChange={(e) => setNewDebt((p) => ({ ...p, balance: Number(e.target.value) }))}
                          className="bg-gray-900/60 border-cyan-500/20 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Faiz Oranı (%)</label>
                        <Input
                          type="number"
                          placeholder="24"
                          value={newDebt.interestRate || ""}
                          onChange={(e) => setNewDebt((p) => ({ ...p, interestRate: Number(e.target.value) }))}
                          className="bg-gray-900/60 border-cyan-500/20 text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 mb-1 block">Minimum Ödeme (TL/ay)</label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={newDebt.minimumPayment || ""}
                          onChange={(e) => setNewDebt((p) => ({ ...p, minimumPayment: Number(e.target.value) }))}
                          className="bg-gray-900/60 border-cyan-500/20 text-white"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={addDebt} className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 gap-1">
                        <Plus className="h-4 w-4" /> Ekle
                      </Button>
                      <Button variant="outline" onClick={() => setShowForm(false)} className="border-gray-600 text-gray-400">
                        İptal
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-2">
                {debts.map((debt) => (
                  <div key={debt.id} className="flex items-center justify-between rounded-lg bg-gray-800/50 border border-gray-700/50 px-4 py-3 group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium text-white">{debt.name}</span>
                      </div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>{formatTL(debt.balance)}</span>
                        <span>%{debt.interestRate} faiz</span>
                        <span>{formatTL(debt.minimumPayment)}/ay min.</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDebt(debt.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Strateji</label>
                  <Select value={strategy} onValueChange={(v) => setStrategy(v as "snowball" | "avalanche")}>
                    <SelectTrigger className="bg-gray-800/50 border-cyan-500/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="snowball">Kartopu (önce küçük borçlar)</SelectItem>
                      <SelectItem value="avalanche">Çığ (önce yüksek faiz)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 mb-1 block">Ek Ödeme (TL/ay)</label>
                  <Input
                    type="number"
                    value={extraPayment}
                    onChange={(e) => setExtraPayment(Number(e.target.value))}
                    className="bg-gray-800/50 border-cyan-500/20 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {plan.schedule.length > 0 && (
            <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-emerald-400" />
                  Borç Azaltma Grafiği
                </CardTitle>
                <CardDescription>
                  {strategy === "snowball" ? "Kartopu" : "Çığ"} yöntemi ile {plan.payoffMonths} ayda borçtan kurtulun
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DebtPayoffChart schedule={plan.schedule} strategy={strategy} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5 text-emerald-400" />
                Strateji Sonuçları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`rounded-lg border p-4 ${strategy === "snowball" ? "border-emerald-500/30 bg-emerald-500/5" : "border-gray-700/50 bg-gray-800/30"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-emerald-400" />
                  <p className="text-sm font-medium text-emerald-400">Kartopu Yöntemi</p>
                  {strategy === "snowball" && (
                    <Badge className="ml-auto bg-emerald-500/20 text-emerald-400 border-0 text-[10px]">Aktif</Badge>
                  )}
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>Toplam Faiz: <span className="text-white font-medium">{formatTL(snowballPlan.totalInterest)}</span></p>
                  <p>Ödeme Süresi: <span className="text-white font-medium">{snowballPlan.payoffMonths} ay</span></p>
                </div>
              </div>

              <div className={`rounded-lg border p-4 ${strategy === "avalanche" ? "border-purple-500/30 bg-purple-500/5" : "border-gray-700/50 bg-gray-800/30"}`}>
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-purple-400" />
                  <p className="text-sm font-medium text-purple-400">Çığ Yöntemi</p>
                  {strategy === "avalanche" && (
                    <Badge className="ml-auto bg-purple-500/20 text-purple-400 border-0 text-[10px]">Aktif</Badge>
                  )}
                </div>
                <div className="space-y-1 text-xs text-gray-400">
                  <p>Toplam Faiz: <span className="text-white font-medium">{formatTL(avalanchePlan.totalInterest)}</span></p>
                  <p>Ödeme Süresi: <span className="text-white font-medium">{avalanchePlan.payoffMonths} ay</span></p>
                </div>
              </div>

              {snowballPlan.totalInterest !== avalanchePlan.totalInterest && (
                <div className="rounded-lg bg-gradient-to-r from-emerald-600/10 to-purple-600/10 border border-cyan-500/20 p-3">
                  <p className="text-xs text-gray-300">
                    <strong className="text-emerald-400">Tasarruf:</strong>{" "}
                    {snowballPlan.totalInterest > avalanchePlan.totalInterest
                      ? `Çığ yöntemi ile ${formatTL(snowballPlan.totalInterest - avalanchePlan.totalInterest)} daha az faiz ödersiniz.`
                      : `Kartopu yöntemi ile ${formatTL(avalanchePlan.totalInterest - snowballPlan.totalInterest)} daha az faiz ödersiniz.`
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Banknote className="h-5 w-5 text-emerald-400" />
                Özet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Toplam Borç</span>
                <span className="text-lg font-bold text-white">
                  {formatTL(debts.reduce((s, d) => s + d.balance, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Aylık Ödeme</span>
                <span className="text-lg font-bold text-white">
                  {formatTL(debts.reduce((s, d) => s + d.minimumPayment, 0) + extraPayment)}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-800">
                <span className="text-sm text-gray-400">Toplam Faiz</span>
                <span className="text-lg font-bold text-red-400">{formatTL(plan.totalInterest)}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-400">Ödeme Süresi</span>
                <span className="text-lg font-bold text-emerald-400">{plan.payoffMonths} ay</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
