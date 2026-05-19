"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Calendar } from "lucide-react"

interface HeatmapData {
  day: number // 0-6 (Sun-Sat)
  category: string
  amount: number
}

interface SpendingHeatmapProps {
  data: HeatmapData[]
  categories: string[]
}

const DAYS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"]

export function SpendingHeatmap({ data, categories }: SpendingHeatmapProps) {
  const maxAmount = useMemo(() => {
    return Math.max(...data.map(d => d.amount), 1)
  }, [data])

  const getOpacity = (amount: number) => {
    if (amount === 0) return 0.05
    return Math.max(0.1, amount / maxAmount)
  }

  const getColor = (amount: number) => {
    const opacity = getOpacity(amount)
    return `rgba(239, 68, 68, ${opacity})` // Red with variable opacity
  }

  // Group data by category and day
  const grid = useMemo(() => {
    const matrix: Record<string, number[]> = {}
    categories.forEach(cat => {
      matrix[cat] = Array(7).fill(0)
    })

    data.forEach(d => {
      if (matrix[d.category]) {
        matrix[d.category][d.day] += d.amount
      }
    })

    return matrix
  }, [data, categories])

  return (
    <Card className="bg-background/40 backdrop-blur-md border border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Harcama Yoğunluğu (Haftalık)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[400px]">
            <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 mb-2">
              <div />
              {DAYS.map(day => (
                <div key={day} className="text-[10px] font-bold text-center text-muted-foreground uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            <TooltipProvider>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="grid grid-cols-[100px_repeat(7,1fr)] gap-2 items-center">
                    <div className="text-[10px] font-medium text-muted-foreground truncate pr-2 uppercase tracking-tighter">
                      {category}
                    </div>
                    {grid[category].map((amount, dayIndex) => (
                      <Tooltip key={dayIndex}>
                        <TooltipTrigger asChild>
                          <div 
                            className="h-8 rounded-sm transition-all duration-300 cursor-help hover:ring-2 hover:ring-primary/40"
                            style={{ backgroundColor: getColor(amount) }}
                          />
                        </TooltipTrigger>
                        <TooltipContent className="bg-background border-primary/20">
                          <p className="text-xs font-bold">{DAYS[dayIndex]} - {category}</p>
                          <p className="text-xs text-primary">{amount.toLocaleString("tr-TR")} TL</p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase">Düşük</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map(op => (
                <div key={op} className="w-3 h-3 rounded-sm" style={{ backgroundColor: `rgba(239, 68, 68, ${op})` }} />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase">Yüksek</span>
          </div>
          <p className="text-[10px] text-muted-foreground italic">
            Son 30 günlük veriler baz alınmıştır.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
