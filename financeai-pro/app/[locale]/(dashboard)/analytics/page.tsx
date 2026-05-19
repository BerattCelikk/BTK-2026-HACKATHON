"use client"

import React, { useState, useEffect } from "react"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from "recharts"
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card"
import { 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  Zap, 
  Users, 
  Download, 
  FileJson,
  AlertTriangle,
  Info
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendReport } from "@/components/analytics/TrendReport"
import { generatePDFReport, generateCSVReport } from "@/lib/report-generator"
import { formatCurrency } from "@/lib/utils"

const COLORS = ["#10b981", "#3b82f6", "#6366f1", "#f59e0b", "#ef4444"]

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAll() {
      try {
        const [portRes, metricsRes, peersRes] = await Promise.all([
          fetch("/api/analytics/portfolio"),
          fetch("/api/analytics/metrics"),
          fetch("/api/analytics/peers")
        ])
        
        const port = await portRes.json()
        const metrics = await metricsRes.json()
        const peers = await peersRes.json()

        setData({ ...port, metrics, peers })
      } catch (err) {
        console.error("Fetch analytics error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  const chartData = Object.entries(data.portfolio.composition)
    .map(([name, value]) => ({ name, value }))
    .filter(item => (item.value as number) > 0)

  const handleExportPDF = () => generatePDFReport("analytics-content", "finansal-analiz-pro.pdf")
  const handleExportCSV = () => generateCSVReport(data.portfolio.rebalanceActions, "portfoy-yeniden-dengeleme.csv")

  return (
    <div id="analytics-content" className="space-y-8 p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Gelişmiş Analitik</h1>
          <p className="text-muted-foreground text-sm mt-1">Portföyünüzü optimize edin ve vergi fırsatlarını yakalayın.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV} className="bg-background/50 gap-2 border-primary/20">
            <FileJson size={16} /> CSV Dışa Aktar
          </Button>
          <Button variant="default" size="sm" onClick={handleExportPDF} className="bg-primary hover:bg-primary/90 gap-2 shadow-lg shadow-primary/20">
            <Download size={16} /> PDF Raporu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Composition */}
        <Card className="lg:col-span-1 bg-background/40 backdrop-blur-md border border-primary/20 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck size={20} className="text-emerald-500" />
              Portföy Dağılımı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "8px" }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-primary/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Toplam Varlık</span>
                <span className="text-lg font-bold text-white">{formatCurrency(data.portfolio.totalWealth)}</span>
              </div>
              <Badge variant={data.portfolio.concentration === "high" ? "destructive" : "secondary"} className="w-full justify-center py-1">
                Risk Seviyesi: {data.portfolio.concentration.toUpperCase()}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* AI Recommendations */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-emerald-500/10 to-blue-500/10 backdrop-blur-md border border-primary/30 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
             <Target size={120} />
          </div>
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Zap size={20} className="text-yellow-400" />
              AI Portföy Önerileri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none">
               <p className="text-gray-200 leading-relaxed italic border-l-4 border-primary pl-4 py-2 bg-primary/5 rounded-r-lg mb-6">
                 "{data.aiRecommendations}"
               </p>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-3">
                   <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Yeniden Dengeleme</h4>
                   {data.portfolio.rebalanceActions.map((action: any, i: number) => (
                     <div key={i} className="flex items-center justify-between text-xs bg-background/50 p-2 rounded-lg border border-primary/10">
                       <span className="font-medium uppercase">{action.asset}</span>
                       <div className="flex items-center gap-2">
                         <span className="text-muted-foreground">%{action.currentPercent} → %{action.targetPercent}</span>
                         <Badge className={action.action === "buy" ? "bg-emerald-500" : "bg-red-500"}>
                           {action.action === "buy" ? "AL" : "SAT"}
                         </Badge>
                       </div>
                     </div>
                   ))}
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Piyasa Fırsatları</h4>
                    {data.opportunities.slice(0, 3).map((opp: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-xs bg-background/50 p-2 rounded-lg border border-primary/10">
                        <span className="font-medium">{opp.asset}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">%{opp.expectedReturn} Getiri</span>
                          <Badge variant="outline" className="border-emerald-500 text-emerald-500">BUY</Badge>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tax Optimization */}
        <Card className="bg-background/40 backdrop-blur-md border border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck size={20} className="text-blue-500" />
              Vergi Optimizasyonu Fırsatları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.taxStrategies.map((strat: any, i: number) => (
              <div key={i} className="p-4 rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-white">{strat.strategy}</h4>
                  <Badge className="bg-blue-500/20 text-blue-400 border-none">
                    +{formatCurrency(strat.savingsPotential)} Tasarruf
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {strat.description}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Peer Benchmarking */}
        <Card className="bg-background/40 backdrop-blur-md border border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Users size={20} className="text-purple-500" />
              Kitle Karşılaştırması (Peer Benchmark)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {data.peers.map((peer: any, i: number) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-muted-foreground uppercase">{peer.metric}</span>
                  <span className="font-bold text-primary">{peer.benchmark}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000" 
                    style={{ width: `${peer.percentile}%` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground italic">
                  <span>Siz: %{peer.userValue}</span>
                  <span>Ortalama: %{peer.peerAverage}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <TrendReport 
        incomeVsExpense={[
          { month: "Ocak", income: 45000, expense: 32000 },
          { month: "Şubat", income: 45000, expense: 35000 },
          { month: "Mart", income: 48000, expense: 33000 },
          { month: "Nisan", income: 46000, expense: 41000 },
          { month: "Mayıs", income: 52000, expense: 34000 },
          { month: "Haziran", income: 55000, expense: 32000 },
        ]}
        savingsTrend={[]}
        netWorthProjection={[
          { month: "Şu an", value: data.portfolio.totalWealth },
          { month: "6 Ay", value: data.portfolio.totalWealth * 1.15 },
          { month: "12 Ay", value: data.portfolio.totalWealth * 1.35 },
          { month: "18 Ay", value: data.portfolio.totalWealth * 1.65 },
          { month: "24 Ay", value: data.portfolio.totalWealth * 2.10 },
        ]}
      />

      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex gap-4 items-start">
        <AlertTriangle size={24} className="text-amber-500 shrink-0" />
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-500">Yasal Uyarı</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Burada yer alan yatırım bilgi, yorum ve tavsiyeleri yatırım danışmanlığı kapsamında değildir. Vergi hesaplamaları tahmini olup, mali müşavirinize danışmanız önerilir. FinanceAI Pro, sunulan verilerin doğruluğu ve piyasa değişimlerinden sorumlu tutulamaz.
          </p>
        </div>
      </div>
    </div>
  )
}
