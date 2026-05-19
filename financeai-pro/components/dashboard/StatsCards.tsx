"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { LineChart, Line, ResponsiveContainer } from "recharts"
import { Wallet, TrendingUp, PiggyBank, ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react"

interface StatItem {
  title: string
  value: string
  change: string
  positive: boolean
  icon: LucideIcon
  color: string
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
}

// Generate random sparkline data
const generateSparklineData = () => {
  return Array.from({ length: 10 }, (_, i) => ({
    value: Math.floor(Math.random() * 100) + 50,
  }))
}

const StatCard = React.memo(({ stat }: { stat: StatItem }) => {
  const sparklineData = useMemo(() => generateSparklineData(), [])
  
  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="group"
    >
      <Card className="relative overflow-hidden bg-background/40 backdrop-blur-md border border-primary/20 shadow-lg shadow-primary/5 group-hover:border-primary/40 group-hover:shadow-primary/10 transition-all duration-300">
        <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl`} />
        
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
            <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
              <stat.icon className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight mb-1">{stat.value}</p>
              <div className="flex items-center gap-1.5">
                <div className={`flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  stat.positive ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                }`}>
                  {stat.positive ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                  {stat.change}
                </div>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">geçen aya göre</span>
              </div>
            </div>
            
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={stat.positive ? "#10b981" : "#ef4444"} 
                    strokeWidth={2} 
                    dot={false} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
})

StatCard.displayName = "StatCard"

export function StatsCards({ stats }: { stats: StatItem[] }) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat) => (
        <StatCard key={stat.title} stat={stat} />
      ))}
    </motion.div>
  )
}
