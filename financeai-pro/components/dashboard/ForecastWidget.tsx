"use client"

import { useState, useMemo, useEffect } from "react"
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TrendingUp, Info, Sparkles, Download, Loader2 } from "lucide-react"
import { calculateWealthForecast, ForecastPoint } from "@/lib/wealth-forecast"
import { formatCurrency } from "@/lib/utils"

export function ForecastWidget({ 
  initialSavings = 0, 
  monthlyContribution = 1000 
}: { 
  initialSavings?: number
  monthlyContribution?: number
}) {
  const [contribution, setContribution] = useState(monthlyContribution)
  const [years, setYears] = useState(10)
  const [returnRate, setReturnRate] = useState(15)
  const [inflation, setInflation] = useState(0)
  
  const [aiAnalysis, setAiAnalysis] = useState<{
    analysis: string
    recommendations: string[]
    marketContext: string
  } | null>(null)
  const [loading, setLoading] = useState(false)

  const data = useMemo(() => {
    return calculateWealthForecast(initialSavings, contribution, returnRate, years, inflation)
  }, [initialSavings, contribution, years, returnRate, inflation])

  const fetchAIAnalysis = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        startAmount: initialSavings.toString(),
        monthlyAddition: contribution.toString(),
        annualReturn: returnRate.toString(),
        years: years.toString(),
        inflation: inflation.toString()
      })
      const response = await fetch(`/api/forecast?${params.toString()}`)
      if (response.ok) {
        const result = await response.json()
        setAiAnalysis({
          analysis: result.analysis,
          recommendations: result.recommendations,
          marketContext: result.marketContext
        })
      }
    } catch (error) {
      console.error("Fetch AI analysis error:", error)
    } finally {
      setLoading(false)
    }
  }

  const finalAmount = data[data.length - 1].amount
  const totalGains = data[data.length - 1].gains

  const exportCSV = () => {
    const headers = ["Yıl", "Tahmini Varlık", "Yatırılan", "Kazanç"]
    const csvRows = data.map(p => `${p.year},${p.amount},${p.invested},${p.gains}`)
    const csvContent = [headers.join(","), ...csvRows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `servet-tahmini-${years}-yil.csv`
    link.click()
  }

  return (
    <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2 text-white">
          <TrendingUp className="h-5 w-5 text-emerald-400" />
          Varlık Tahmini & AI Analizi
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={exportCSV}
          className="bg-gray-800/50 border-cyan-500/20 text-xs gap-2"
        >
          <Download size={14} />
          CSV İndir
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-gray-300">Aylık Birikim (TL)</Label>
                  <span className="text-emerald-400 font-bold">{formatCurrency(contribution)}</span>
                </div>
                <Slider 
                  value={[contribution]} 
                  onValueChange={(v) => setContribution(v[0])} 
                  max={50000} 
                  step={500}
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <Label className="text-gray-300">Yıllık Beklenen Getiri (%)</Label>
                  <span className="text-cyan-400 font-bold">%{returnRate}</span>
                </div>
                <Slider 
                  value={[returnRate]} 
                  onValueChange={(v) => setReturnRate(v[0])} 
                  max={100} 
                  step={1}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-gray-300 text-xs">Süre (Yıl)</Label>
                    <span className="text-purple-400 font-bold text-xs">{years} Yıl</span>
                  </div>
                  <Slider 
                    value={[years]} 
                    onValueChange={(v) => setYears(v[0])} 
                    min={1}
                    max={40} 
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label className="text-gray-300 text-xs">Enflasyon (%)</Label>
                    <span className="text-rose-400 font-bold text-xs">%{inflation}</span>
                  </div>
                  <Slider 
                    value={[inflation]} 
                    onValueChange={(v) => setInflation(v[0])} 
                    max={100} 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-800/50 p-2 text-center">
                <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">5 Yıl Sonra</p>
                <p className="text-sm font-bold text-white">
                  {formatCurrency(data[Math.min(5, years)]?.amount || 0)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-2 text-center">
                <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">10 Yıl Sonra</p>
                <p className="text-sm font-bold text-white">
                  {formatCurrency(data[Math.min(10, years)]?.amount || 0)}
                </p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-2 text-center">
                <p className="text-[9px] text-gray-500 uppercase font-bold mb-1">20 Yıl Sonra</p>
                <p className="text-sm font-bold text-white">
                  {formatCurrency(data[Math.min(20, years)]?.amount || 0)}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Button 
                onClick={fetchAIAnalysis} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                AI Analizi Oluştur
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="h-[200px] w-full bg-gray-800/20 rounded-xl p-2 border border-gray-800">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={finalAmount >= data[0].amount ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={finalAmount >= data[0].amount ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} opacity={0.5} />
                  <XAxis dataKey="year" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#030712", border: "1px solid #1f2937", borderRadius: "8px" }}
                    itemStyle={{ color: "#10b981" }}
                    formatter={(value: number) => [formatCurrency(value), "Varlık"]}
                    labelFormatter={(label) => `${label}. Yıl`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="amount" 
                    stroke={finalAmount >= data[0].amount ? "#10b981" : "#ef4444"} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorAmount)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-400 uppercase font-bold mb-1">Tahmini Toplam</p>
                <p className="text-lg font-bold text-white leading-none">{formatCurrency(finalAmount)}</p>
              </div>
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <p className="text-[10px] text-cyan-400 uppercase font-bold mb-1">Bileşik Getiri</p>
                <p className="text-lg font-bold text-white leading-none">+{formatCurrency(totalGains)}</p>
              </div>
            </div>
          </div>
        </div>

        {aiAnalysis && (
          <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 rounded-xl bg-gray-800/40 border border-cyan-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Strateji Analizi</h3>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                {aiAnalysis.analysis}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase">Tavsiyeler</h4>
                  <ul className="space-y-2">
                    {aiAnalysis.recommendations.map((rec, i) => (
                      <li key={i} className="text-xs text-gray-400 flex items-start gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase">Piyasa Bağlamı</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {aiAnalysis.marketContext}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-2 rounded-lg bg-blue-500/5 p-3 border border-blue-500/10">
          <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-gray-400 italic">
            Bu hesaplama bileşik getiri esasına dayanmaktadır. Enflasyon seçeneği "reel getiri" üzerinden hesaplama yapar. Yatırım getirileri piyasa koşullarına göre değişkenlik gösterebilir ve yatırım tavsiyesi değildir.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
