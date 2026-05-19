"use client"

import React, { useState, useEffect } from "react"
import { RecommendationCard, RecommendationCardProps } from "./RecommendationCard"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, Sparkles } from "lucide-react"
import Link from "next/navigation"

export function RecommendationsFeed() {
  const [recommendations, setRecommendations] = useState<RecommendationCardProps[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/recommendations/generate", { method: "POST" })
        const data = await response.json()
        
        const mapped: RecommendationCardProps[] = [
          ...(data.rebalancingAlerts || []).map((a: any) => ({
            id: a.id,
            type: "alert",
            title: "Portföy Dengesi",
            description: a.alert,
            impact: "Portföy Optimizasyonu"
          })),
          ...(data.spendingOptimizations || []).map((o: any) => ({
            id: o.id,
            type: "optimize",
            title: o.title,
            description: o.description,
            impact: `${Math.round(o.yearlySavings).toLocaleString("tr-TR")} TL / Yıl`
          })),
          ...(data.suggestedGoals || []).map((g: any) => ({
            id: g.title,
            type: "goal",
            title: g.title,
            description: g.description,
            impact: "Finansal Sağlık"
          }))
        ]

        setRecommendations(mapped.slice(0, 5))
      } catch (error) {
        console.error("Feed error:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [])

  const handleDismiss = async (id: string) => {
    setRecommendations(prev => prev.filter(r => r.id !== id))
    await fetch("/api/recommendations/dismiss", {
      method: "POST",
      body: JSON.stringify({ recommendationId: id })
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-32 w-full animate-pulse bg-muted/20 rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <Sparkles size={14} className="text-primary" />
          Akıllı Öneriler
        </h3>
        <a 
          href="/recommendations" 
          className="text-[10px] font-bold uppercase text-primary hover:underline flex items-center gap-1"
        >
          Tümünü Gör <ArrowRight size={10} />
        </a>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-8 text-center bg-muted/10 rounded-xl border border-dashed border-primary/20">
          <p className="text-xs text-muted-foreground italic">Şu an için yeni bir öneri bulunmuyor.</p>
        </div>
      ) : (
        recommendations.map(rec => (
          <RecommendationCard 
            key={rec.id} 
            {...rec} 
            onDismiss={() => handleDismiss(rec.id)}
          />
        ))
      )}
    </div>
  )
}
