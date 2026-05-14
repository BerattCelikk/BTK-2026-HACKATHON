"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
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

export function StatsCards({ stats }: { stats: StatItem[] }) {
  return (
    <motion.div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {stats.map((stat) => (
        <motion.div key={stat.title} variants={cardVariants}>
          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5 hover:border-cyan-500/40 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">{stat.title}</p>
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
              <div className="flex items-center gap-1">
                {stat.positive ? (
                  <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm ${stat.positive ? "text-emerald-400" : "text-red-400"}`}>
                  {stat.change}
                </span>
                <span className="text-xs text-gray-500 ml-1">geçen aya göre</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  )
}
