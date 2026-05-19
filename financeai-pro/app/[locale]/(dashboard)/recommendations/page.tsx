"use client"

import React, { useState, useEffect } from "react"
import { RecommendationCard, RecommendationCardProps } from "@/components/recommendations/RecommendationCard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sparkles, TrendingDown, Target, Zap, AlertTriangle, Brain } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

export default function RecommendationsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/recommendations/generate", { method: "POST" })
        const json = await res.json()
        setData(json)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Akıllı Yol Haritası</h1>
          <p className="text-muted-foreground text-sm mt-1">AI tarafından hazırlanan size özel finansal stratejiler.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold">
           <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
           AI AKTİF ANALİZ
        </div>
      </div>

      {/* AI Holistic Advice */}
      <Card className="bg-gradient-to-br from-primary/10 via-background to-blue-500/10 border-primary/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Brain size={200} />
        </div>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Sparkles className="text-primary" />
            AI Finansal Değerlendirme
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert prose-sm max-w-none">
            <div className="text-gray-200 leading-relaxed text-base">
              {data.aiAdvice.split("\n").map((line: string, i: number) => (
                <p key={i} className="mb-4">{line}</p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="optimize" className="w-full">
        <TabsList className="bg-muted/20 border border-primary/10 p-1 mb-8">
          <TabsTrigger value="optimize" className="gap-2"><TrendingDown size={14} /> Gider Optimizasyonu</TabsTrigger>
          <TabsTrigger value="goals" className="gap-2"><Target size={14} /> Hedef Önerileri</TabsTrigger>
          <TabsTrigger value="invest" className="gap-2"><Zap size={14} /> Yatırım Stratejisi</TabsTrigger>
        </TabsList>

        <TabsContent value="optimize" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.spendingOptimizations.map((opt: any) => (
              <RecommendationCard 
                key={opt.id}
                id={opt.id}
                type="optimize"
                title={opt.title}
                description={opt.description}
                impact={`${formatCurrency(opt.yearlySavings)} / Yıl`}
                actionLabel="Tasarruf Planı"
              />
            ))}
            {data.spendingInsights.filter((i: any) => i.trend === "up").map((ins: any) => (
              <RecommendationCard 
                key={ins.category}
                id={ins.category}
                type="alert"
                title={`${ins.category} Gider Artışı`}
                description={ins.insight}
                impact={`%${Math.round(ins.percentageChange)} Artış`}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {data.suggestedGoals.map((goal: any) => (
              <RecommendationCard 
                key={goal.title}
                id={goal.title}
                type="goal"
                title={goal.title}
                description={goal.description}
                impact={goal.timeframe}
                actionLabel="Hedef Belirle"
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="invest" className="space-y-6">
           <Card className="bg-background/40 backdrop-blur-md border border-primary/20">
             <CardHeader>
               <CardTitle className="text-lg">Kişiselleştirilmiş Varlık Dağılımı</CardTitle>
             </CardHeader>
             <CardContent>
               <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                 {Object.entries(data.investmentAllocation).filter(([k]) => k !== "explanation").map(([asset, percent]) => (
                   <div key={asset} className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-center">
                     <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{asset}</p>
                     <p className="text-2xl font-bold text-primary">%{percent as number}</p>
                   </div>
                 ))}
               </div>
               <p className="text-sm text-gray-400 italic bg-muted/20 p-4 rounded-lg border-l-4 border-primary">
                 "{data.investmentAllocation.explanation}"
               </p>
             </CardContent>
           </Card>
           
           {data.rebalancingAlerts.length > 0 && (
             <div className="space-y-4">
               <h3 className="text-sm font-bold uppercase tracking-widest text-amber-500">Yeniden Dengeleme Gerekli</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {data.rebalancingAlerts.map((alert: any) => (
                    <RecommendationCard 
                      key={alert.id}
                      id={alert.id}
                      type="alert"
                      title="Denge Bozuldu"
                      description={alert.alert}
                      impact={alert.action}
                      actionLabel="Hemen Dengele"
                    />
                 ))}
               </div>
             </div>
           )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
