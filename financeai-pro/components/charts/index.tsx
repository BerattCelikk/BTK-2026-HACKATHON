"use client"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js"
import { Line, Bar, Doughnut } from "react-chartjs-2"

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const chartDefaults = {
  color: "#9CA3AF",
  grid: { color: "rgba(75, 85, 99, 0.3)" },
}

export function PortfolioChart({
  data,
}: {
  data: { year: number; conservative: number; moderate: number; aggressive: number }[]
}) {
  const chartData = {
    labels: data.map((d) => `${d.year}. Yıl`),
    datasets: [
      {
        label: "Düşük Risk",
        data: data.map((d) => d.conservative),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Orta Risk",
        data: data.map((d) => d.moderate),
        borderColor: "#6366F1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Yüksek Risk",
        data: data.map((d) => d.aggressive),
        borderColor: "#F59E0B",
        backgroundColor: "rgba(245, 158, 11, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  return (
    <Line
      data={chartData}
      options={{
        responsive: true,
        color: chartDefaults.color,
        scales: {
          x: { grid: { color: chartDefaults.grid.color } },
          y: {
            grid: { color: chartDefaults.grid.color },
            ticks: { callback: (v) => `${(v as number / 1000).toFixed(0)}k TL` },
          },
        },
        plugins: {
          legend: { position: "bottom" as const, labels: { color: chartDefaults.color } },
        },
      }}
    />
  )
}

export function ExpenseChart({
  data,
}: {
  data: { name: string; amount: number; percentage: number }[]
}) {
  const colors = [
    "#10B981",
    "#6366F1",
    "#F59E0B",
    "#EF4444",
    "#8B5CF6",
    "#EC4899",
    "#14B8A6",
    "#F97316",
  ]

  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        data: data.map((d) => d.amount),
        backgroundColor: colors.slice(0, data.length),
        borderWidth: 0,
      },
    ],
  }

  return (
    <Doughnut
      data={chartData}
      options={{
        responsive: true,
        color: chartDefaults.color,
        plugins: {
          legend: {
            position: "bottom" as const,
            labels: { color: chartDefaults.color, padding: 12 },
          },
        },
        cutout: "65%",
      }}
    />
  )
}

export function DebtPayoffChart({
  schedule,
  strategy,
}: {
  schedule: { month: number; remainingBalance: number }[]
  strategy: "snowball" | "avalanche"
}) {
  const isSnowball = strategy === "snowball"
  const lineColor = isSnowball ? "#10B981" : "#6366F1"
  const fillColor = isSnowball ? "rgba(16, 185, 129, 0.15)" : "rgba(99, 102, 241, 0.15)"
  const label = isSnowball ? "Kartopu Yöntemi" : "Çığ Yöntemi"

  const maxBalance = Math.max(...schedule.map((s) => s.remainingBalance), 1)

  const chartData = {
    labels: schedule.map((s) => `${s.month}. Ay`),
    datasets: [
      {
        label,
        data: schedule.map((s) => s.remainingBalance),
        borderColor: lineColor,
        backgroundColor: fillColor,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHitRadius: 10,
      },
    ],
  }

  return (
    <div className="relative">
      <Line
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: true,
          color: chartDefaults.color,
          scales: {
            x: {
              grid: { color: chartDefaults.grid.color, display: true },
              ticks: {
                color: chartDefaults.color,
                maxTicksLimit: 12,
                font: { size: 10 },
              },
            },
            y: {
              grid: { color: chartDefaults.grid.color },
              ticks: {
                color: chartDefaults.color,
                callback: (v) => `${((v as number) / 1000).toFixed(0)}k TL`,
                font: { size: 10 },
              },
              max: maxBalance * 1.05,
            },
          },
          plugins: {
            legend: {
              position: "bottom" as const,
              labels: {
                color: chartDefaults.color,
                padding: 16,
                usePointStyle: true,
                font: { size: 11 },
              },
            },
            tooltip: {
              backgroundColor: "rgba(17, 24, 39, 0.95)",
              titleColor: "#f9fafb",
              bodyColor: "#9CA3AF",
              borderColor: "rgba(6, 182, 212, 0.3)",
              borderWidth: 1,
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString("tr-TR")} TL`,
              },
            },
          },
        }}
      />
      <div className="absolute top-2 right-2 flex items-center gap-2 rounded-full px-3 py-1 text-xs"
        style={{
          backgroundColor: isSnowball ? "rgba(16, 185, 129, 0.1)" : "rgba(99, 102, 241, 0.1)",
          color: lineColor,
          border: `1px solid ${lineColor}20`,
        }}
      >
        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: lineColor }} />
        {label}
      </div>
    </div>
  )
}

export function BudgetChart({
  data,
}: {
  data: { name: string; planned: number; actual: number }[]
}) {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: "Planlanan",
        data: data.map((d) => d.planned),
        backgroundColor: "rgba(16, 185, 129, 0.6)",
        borderRadius: 4,
      },
      {
        label: "Gerçekleşen",
        data: data.map((d) => d.actual),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderRadius: 4,
      },
    ],
  }

  return (
    <Bar
      data={chartData}
      options={{
        responsive: true,
        color: chartDefaults.color,
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: chartDefaults.grid.color } },
        },
        plugins: {
          legend: {
            position: "bottom" as const,
            labels: { color: chartDefaults.color },
          },
        },
      }}
    />
  )
}
