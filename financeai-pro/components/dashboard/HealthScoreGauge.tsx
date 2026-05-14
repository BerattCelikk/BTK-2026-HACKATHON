"use client"

import { useEffect, useState } from "react"

const size = 160
const strokeWidth = 10
const radius = (size - strokeWidth) / 2
const circumference = 2 * Math.PI * radius

export function HealthScoreGauge({ score }: { score: number }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300)
    return () => clearTimeout(timer)
  }, [score])

  const clampedScore = Math.max(0, Math.min(100, animatedScore))
  const offset = circumference - (clampedScore / 100) * circumference

  const getColor = () => {
    if (clampedScore >= 80) return { stroke: "#10B981", glow: "rgba(16,185,129,0.4)" }
    if (clampedScore >= 50) return { stroke: "#F59E0B", glow: "rgba(245,158,11,0.4)" }
    return { stroke: "#EF4444", glow: "rgba(239,68,68,0.4)" }
  }

  const getLabel = () => {
    if (clampedScore >= 80) return "Mükemmel"
    if (clampedScore >= 50) return "İyi"
    return "İyileştirilmeli"
  }

  const color = getColor()

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(55, 65, 81, 0.5)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${color.glow})`,
            animation: clampedScore > 0 ? "pulseGlow 2s ease-in-out infinite" : "none",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-3xl font-bold text-white transition-all duration-1000">
          {Math.round(clampedScore)}
        </span>
        <span className="text-[10px] text-gray-500">/ 100</span>
      </div>
      <span className="text-xs font-medium" style={{ color: color.stroke }}>
        {getLabel()}
      </span>
      <style jsx>{`
        @keyframes pulseGlow {
          0%, 100% { filter: drop-shadow(0 0 8px ${color.glow}); }
          50% { filter: drop-shadow(0 0 18px ${color.glow}); }
        }
      `}</style>
    </div>
  )
}
