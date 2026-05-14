"use client"

import { Award, PiggyBank, Shield, TrendingUp, Target, Sparkles } from "lucide-react"

interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

const iconMap: Record<string, React.ElementType> = {
  PiggyBank,
  Shield,
  TrendingUp,
  Target,
  Award,
  Sparkles,
}

export function BadgesSection({ badges }: { badges: Badge[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {badges.map((badge) => {
        const Icon = iconMap[badge.icon] || Award
        return (
          <div
            key={badge.id}
            className={`rounded-lg border p-3 transition-all duration-300 ${
              badge.unlocked
                ? "border-emerald-500/30 bg-emerald-500/5"
                : "border-gray-700/50 bg-gray-800/30 opacity-50"
            }`}
          >
            <div className="flex flex-col items-center text-center gap-1.5">
              <div
                className={`rounded-full p-2 ${
                  badge.unlocked
                    ? "bg-emerald-500/20"
                    : "bg-gray-700/50"
                }`}
                style={
                  badge.unlocked
                    ? { filter: "drop-shadow(0 0 12px rgba(16,185,129,0.4))" }
                    : undefined
                }
              >
                <Icon
                  className={`h-4 w-4 ${
                    badge.unlocked ? "text-emerald-400" : "text-gray-500"
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  badge.unlocked ? "text-white" : "text-gray-500"
                }`}
              >
                {badge.name}
              </span>
              <span className="text-[10px] text-gray-500 leading-tight">
                {badge.description}
              </span>
              {badge.unlocked && (
                <span className="text-[9px] font-medium text-emerald-400/70 uppercase tracking-wider">
                  Açıldı
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
