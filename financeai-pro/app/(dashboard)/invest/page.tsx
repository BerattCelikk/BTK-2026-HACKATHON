"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, PieChart, LineChart, Calculator, AlertTriangle, RefreshCw } from "lucide-react"
import { PortfolioChart } from "@/components/charts"
import { MarketTicker } from "@/components/shared/MarketTicker"

export default function InvestPage() {
  const [riskProfile, setRiskProfile] = useState("moderate")
  const [amount, setAmount] = useState("10000")
  const [months, setMonths] = useState("12")
  const [simulating, setSimulating] = useState(false)
  const [simulationResult, setSimulationResult] = useState<any>(null)
  const [simulationError, setSimulationError] = useState<string | null>(null)

  const handleRunSimulation = async () => {
    setSimulationError(null)
    setSimulationResult(null)
    setSimulating(true)

    try {
      const res = await fetch("/api/agents/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riskProfile,
          amount: Number(amount),
          horizon: "5",
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }

      const data = await res.json()
      setSimulationResult(data)
    } catch (err) {
      setSimulationError(
        err instanceof Error ? err.message : "Simülasyon başarısız"
      )
    } finally {
      setSimulating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Yatırım Danışmanı</h1>
        <p className="text-gray-400 mt-1">AI destekli yatırım önerileri ve portföy simülasyonu</p>
      </div>

      <MarketTicker />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5 text-emerald-400" />
                Portföy Simülatörü
              </CardTitle>
              <CardDescription>Yatırım parametrelerinizi girin</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Yatırım Miktarı (TL)</label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="10.000"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Vade (Ay)</label>
                  <Input
                    type="number"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                    placeholder="12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Risk Profili</label>
                <Select value={riskProfile} onValueChange={setRiskProfile}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="conservative">Düşük Risk</SelectItem>
                    <SelectItem value="moderate">Orta Risk</SelectItem>
                    <SelectItem value="aggressive">Yüksek Risk</SelectItem>
                    <SelectItem value="very_aggressive">Çok Yüksek Risk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleRunSimulation}
                disabled={simulating || !amount || Number(amount) <= 0}
                className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
              >
                {simulating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Simüle ediliyor...
                  </>
                ) : (
                  <>
                    <Calculator className="h-4 w-4" />
                    Simülasyonu Çalıştır
                  </>
                )}
              </Button>

              {simulationError && (
                <div className="flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-300">{simulationError}</p>
                </div>
              )}

              {simulationResult && (
                <div className="space-y-4 pt-2">
                  <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4">
                    <h4 className="text-sm font-semibold text-emerald-300 mb-3">
                      Portföy Dağılımı ({Number(simulationResult.amount).toLocaleString("tr-TR")} TL)
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(simulationResult.allocation.allocation as Record<string, number>).map(
                        ([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <span className="text-sm text-gray-300 capitalize">
                              {key === "stocks" && "Hisse Senedi"}
                              {key === "bonds" && "Tahvil"}
                              {key === "cash" && "Nakit"}
                              {key === "crypto" && "Kripto"}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-32 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                                  style={{ width: `${(value as number) * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold text-white w-12 text-right">
                                {((value as number) * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-blue-500/10 border border-blue-500/30 p-3">
                      <p className="text-xs text-gray-400">Beklenen Yıllık Getiri</p>
                      <p className="text-lg font-bold text-blue-300">
                        {(simulationResult.allocation.expectedReturn * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded-lg bg-purple-500/10 border border-purple-500/30 p-3">
                      <p className="text-xs text-gray-400">Risk Seviyesi</p>
                      <p className="text-lg font-bold text-purple-300 capitalize">
                        {simulationResult.allocation.riskLevel}
                      </p>
                    </div>
                  </div>

                  {simulationResult.allocation.description && (
                    <div className="rounded-lg bg-gray-800/50 border border-cyan-500/10 p-3">
                      <p className="text-sm text-gray-300 italic">
                        {simulationResult.allocation.description}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Profilleri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { level: "Düşük Risk", alloc: "%60 Tahvil, %30 Nakit, %10 Hisse", color: "text-green-400" },
                { level: "Orta Risk", alloc: "%40 Hisse, %30 Tahvil, %30 Nakit", color: "text-yellow-400" },
                { level: "Yüksek Risk", alloc: "%70 Hisse, %20 Kripto, %10 Nakit", color: "text-orange-400" },
                { level: "Çok Yüksek Risk", alloc: "%80 Hisse, %20 Kripto", color: "text-red-400" },
              ].map((profile) => (
                <div key={profile.level} className="rounded-lg bg-gray-800/50 p-3">
                  <p className="text-sm font-medium">{profile.level}</p>
                  <p className="text-xs text-gray-500 mt-1">{profile.alloc}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                Uyarılar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-500">
                Yatırımlarınızın değeri düşebilir. Geçmiş performans gelecekteki getiriler için garanti değildir.
                Risk toleransınızı aşan yatırımlardan kaçının.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
