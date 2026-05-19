"use client"

import React, { useState, useMemo, useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import { WidgetManager } from "./WidgetManager"
import { StatsCards } from "./StatsCards"
import { MarketTicker } from "@/components/shared/MarketTicker"
import { ExportReportButton } from "./ExportReportButton"
import { AgentConversation } from "@/components/agents/AgentConversation"
import { RecommendationsFeed } from "@/components/recommendations/RecommendationsFeed"
import { ExpenseChart } from "@/components/charts"
import { ForecastWidget } from "./ForecastWidget"
import { HealthScoreGauge } from "./HealthScoreGauge"
import { BadgesSection } from "./BadgesSection"
import { TransactionFilters } from "./TransactionFilters"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Heart, Award, AlertTriangle, WifiOff, Clock } from "lucide-react"
import { filterTransactions } from "@/lib/transaction-filters"
import { isOnline, getCachedData, cacheData } from "@/lib/offline-storage"

// Lazy load heavy components
const TrendAnalytics = dynamic(() => import("./TrendAnalytics").then(mod => mod.TrendAnalytics), {
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/20 rounded-xl" />,
  ssr: false
})

const SpendingHeatmap = dynamic(() => import("./SpendingHeatmap").then(mod => mod.SpendingHeatmap), {
  loading: () => <div className="h-[300px] w-full animate-pulse bg-muted/20 rounded-xl" />,
  ssr: false
})

interface DashboardClientProps {
  userId: string
  firstName: string
  data: any
  stats: any[]
  anomalies: any[]
  briefing: string
  transactions: any[]
}

export const DashboardClient = React.memo(({ 
  userId, 
  firstName, 
  data, 
  stats, 
  anomalies, 
  briefing,
  transactions: initialTransactions
}: DashboardClientProps) => {
  const [filteredTransactions, setFilteredTransactions] = useState(initialTransactions)
  const [online, setOnline] = useState(true)
  const [lastSync, setLastSync] = useState<string | null>(null)

  useEffect(() => {
    async function checkStatus() {
      const status = await isOnline()
      setOnline(status)
      if (status) {
        setLastSync(new Date().toLocaleTimeString("tr-TR"))
        cacheData("dashboard-state", { stats, anomalies, briefing })
      }
    }
    checkStatus()
    
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [stats, anomalies, briefing])

  const handleFilterChange = useCallback((filters: any) => {
    const results = filterTransactions(initialTransactions, filters)
    setFilteredTransactions(results)
  }, [initialTransactions])

  // Prepare data for TrendAnalytics
  const trendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - i)
      return d.toISOString().split("T")[0]
    }).reverse()

    return last30Days.map(date => {
      const dayTotal = initialTransactions
        .filter(t => t.type === "EXPENSE" && t.date.startsWith(date))
        .reduce((sum, t) => sum + t.amount, 0)
      
      return {
        date,
        amount: dayTotal,
        isAnomaly: anomalies.some(a => a.transactionId && initialTransactions.find(t => t.id === a.transactionId)?.date.startsWith(date))
      }
    })
  }, [initialTransactions, anomalies])

  // Prepare data for SpendingHeatmap
  const heatmapData = useMemo(() => {
    return initialTransactions
      .filter(t => t.type === "EXPENSE")
      .map(t => ({
        day: new Date(t.date).getDay(),
        category: t.category,
        amount: t.amount
      }))
  }, [initialTransactions])

  const categories = useMemo(() => {
    return Array.from(new Set(initialTransactions.map(t => t.category)))
  }, [initialTransactions])

  const widgets = useMemo(() => [
    {
      id: "briefing",
      title: "Daily Briefing",
      component: (
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <div className="mt-2 rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 p-4 shadow-lg shadow-emerald-500/5">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-sm text-gray-200 leading-relaxed">{briefing}</p>
              </div>
            </div>
          </div>
          <ExportReportButton />
        </div>
      )
    },
    {
      id: "stats",
      title: "Statistics Cards",
      component: <StatsCards stats={stats} />
    },
    {
      id: "analytics",
      title: "Analytics Trends",
      component: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendAnalytics data={trendData} />
          <SpendingHeatmap data={heatmapData} categories={categories} />
        </div>
      )
    },
    {
      id: "main-content",
      title: "Main Dashboard Content",
      component: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AgentConversation />
            
            <RecommendationsFeed />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">İşlemler</h3>
                <TransactionFilters onFilterChange={handleFilterChange} />
              </div>
              
              {data.expenseBreakdown.length > 0 && (
                <Card className="bg-background/40 backdrop-blur-md border border-primary/20 shadow-lg shadow-primary/5">
                  <CardHeader>
                    <CardTitle className="text-lg">Harcama Dağılımı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-w-md mx-auto">
                      <ExpenseChart data={data.expenseBreakdown} />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <ForecastWidget 
              initialSavings={data.totalInvestments} 
              monthlyContribution={data.currentSavings > 0 ? data.currentSavings : 1000} 
            />
          </div>

          <div className="space-y-4">
            <Card className="bg-background/40 backdrop-blur-md border border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-emerald-400" />
                  Finansal Sağlık
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center pb-4">
                <HealthScoreGauge score={data.healthScore} />
                {data.savingsRate > 0 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Birikim oranı: %{data.savingsRate.toFixed(1)}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-background/40 backdrop-blur-md border border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-400" />
                  Rozetler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BadgesSection badges={data.badges} />
              </CardContent>
            </Card>

            {anomalies.length > 0 && (
              <Card className="border-amber-500/50 bg-amber-950/20 backdrop-blur-md shadow-lg shadow-amber-500/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2 text-amber-400">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    Anomali Tespit Edildi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {anomalies.map((a, i) => (
                    <div key={i} className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                      <p className="text-sm font-medium text-gray-200">{a.message}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="bg-background/40 backdrop-blur-md border border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">AI Ajanlar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { name: "Finansal Analist", badge: "Analiz", color: "bg-blue-500/10 text-blue-400" },
                  { name: "Yatırım Danışmanı", badge: "Yatırım", color: "bg-purple-500/10 text-purple-400" },
                  { name: "Bütçe Uzmanı", badge: "Bütçe", color: "bg-emerald-500/10 text-emerald-400" },
                ].map((agent) => (
                  <div key={agent.name} className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span className="text-sm">{agent.name}</span>
                    <Badge className={`${agent.color} border-0`}>{agent.badge}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  ], [userId, briefing, stats, trendData, heatmapData, categories, data, anomalies, handleFilterChange])

  return (
    <div className="space-y-6">
      {!online && (
        <div className="bg-amber-500/20 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest">
            <WifiOff size={16} /> Çevrimdışı Mod
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-amber-500/70 font-medium">
            <Clock size={12} /> Son Güncelleme: {lastSync || "Bilinmiyor"}
          </div>
        </div>
      )}
      <MarketTicker />
      <WidgetManager 
        widgets={widgets} 
        storageKey={`dashboard-layout-${userId}`} 
      />
    </div>
  )
})

DashboardClient.displayName = "DashboardClient"
