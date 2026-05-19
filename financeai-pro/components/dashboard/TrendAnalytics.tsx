"use client"

import React, { useMemo } from "react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingDown, TrendingUp, AlertCircle } from "lucide-react"

interface TrendData {
  date: string
  amount: number
  isAnomaly?: boolean
}

interface TrendAnalyticsProps {
  data: TrendData[]
}

export function TrendAnalytics({ data }: TrendAnalyticsProps) {
  const average = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.amount, 0) / data.length
  }, [data])

  const latestTrend = useMemo(() => {
    if (data.length < 2) return "neutral"
    const last = data[data.length - 1].amount
    const prev = data[data.length - 2].amount
    return last < prev ? "down" : "up"
  }, [data])

  return (
    <Card className="bg-background/40 backdrop-blur-md border border-primary/20 shadow-lg shadow-primary/5">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          {latestTrend === "down" ? (
            <TrendingDown className="h-5 w-5 text-emerald-500" />
          ) : (
            <TrendingUp className="h-5 w-5 text-red-500" />
          )}
          Harcama Trendi (Son 30 Gün)
        </CardTitle>
        <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
          latestTrend === "down" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
        }`}>
          {latestTrend === "down" ? "Düşüşte" : "Artışta"}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={latestTrend === "down" ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={latestTrend === "down" ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/20" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="currentColor" 
                className="text-muted-foreground" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(str) => new Date(str).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
              />
              <YAxis 
                stroke="currentColor" 
                className="text-muted-foreground" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(val) => `${val} TL`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "var(--background)", 
                  borderColor: "var(--border)",
                  borderRadius: "8px",
                  fontSize: "12px"
                }}
                itemStyle={{ color: latestTrend === "down" ? "#10b981" : "#ef4444" }}
              />
              <ReferenceLine y={average} stroke="#64748b" strokeDasharray="3 3" label={{ position: 'right', value: 'Ort.', fill: '#64748b', fontSize: 10 }} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke={latestTrend === "down" ? "#10b981" : "#ef4444"} 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorAmount)" 
              />
              {data.map((entry, index) => entry.isAnomaly ? (
                <ReferenceLine 
                  key={index}
                  x={entry.date} 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="3 3"
                />
              ) : null)}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground bg-muted/20 p-2 rounded-lg">
          <AlertCircle className="h-3 w-3 text-amber-500" />
          Kesikli çizgiler sistem tarafından tespit edilen harcama anomalilerini gösterir.
        </div>
      </CardContent>
    </Card>
  )
}
