"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  TrendingUp, 
  Target, 
  Zap, 
  AlertTriangle, 
  X, 
  ArrowRight,
  TrendingDown,
  Sparkles
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export interface RecommendationCardProps {
  id: string
  type: "optimize" | "goal" | "invest" | "alert"
  title: string
  description: string
  impact?: string
  actionLabel?: string
  onAction?: () => void
  onDismiss?: () => void
}

const CONFIG = {
  optimize: {
    icon: TrendingDown,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20"
  },
  goal: {
    icon: Target,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20"
  },
  invest: {
    icon: Zap,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20"
  },
  alert: {
    icon: AlertTriangle,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20"
  }
}

export function RecommendationCard({
  id,
  type,
  title,
  description,
  impact,
  actionLabel = "İncele",
  onAction,
  onDismiss
}: RecommendationCardProps) {
  const config = CONFIG[type]
  const Icon = config.icon

  return (
    <Card className={cn(
      "relative overflow-hidden bg-background/40 backdrop-blur-md transition-all hover:shadow-lg",
      config.border
    )}>
      <CardContent className="p-5">
        <div className="flex gap-4">
          <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner", config.bg)}>
            <Icon className={cn("h-5 w-5", config.color)} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-sm text-white truncate pr-6">{title}</h4>
              <button 
                onClick={onDismiss}
                className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed mb-4">
              {description}
            </p>

            {impact && (
              <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] font-bold text-primary uppercase tracking-wider mb-4">
                <Sparkles size={10} />
                Potansiyel: {impact}
              </div>
            )}

            <div className="flex items-center justify-between gap-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onAction}
                className="h-8 text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-primary/10 hover:text-primary transition-all p-0"
              >
                {actionLabel} <ArrowRight size={12} />
              </Button>
              
              <div className={cn("h-1 w-12 rounded-full", config.bg)} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
