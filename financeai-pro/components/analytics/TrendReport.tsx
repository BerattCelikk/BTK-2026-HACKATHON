"use client"

import React, { useMemo } from "react"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  Legend,
  AreaChart,
  Area
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BarChart3, PieChart as PieChartIcon } from "lucide-react"

interface TrendReportProps {
  incomeVsExpense: any[]
  savingsTrend: any[]
  netWorthProjection: any[]
}

export function TrendReport({ incomeVsExpense, savingsTrend, netWorthProjection }: TrendReportProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Income vs Expense */}
      <Card className="bg-background/40 backdrop-blur-md border border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            Gelir vs Gider (Son 6 Ay)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/10" vertical={false} />
                <XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "8px" }}
                  cursor={{ fill: "var(--muted)", opacity: 0.1 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "10px", paddingTop: "10px" }} />
                <Bar dataKey="income" name="Gelir" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Gider" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Net Worth Projection */}
      <Card className="bg-background/40 backdrop-blur-md border border-primary/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <TrendingUp size={16} className="text-cyan-500" />
            Varlık Projeksiyonu (24 Ay)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthProjection}>
                <defs>
                  <linearGradient id="colorNetWorth" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/10" vertical={false} />
                <XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v/1000}k`} />
                <Tooltip 
                   contentStyle={{ backgroundColor: "var(--background)", borderColor: "var(--border)", borderRadius: "8px" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#06b6d4" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorNetWorth)" 
                  name="Tahmini Varlık"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
