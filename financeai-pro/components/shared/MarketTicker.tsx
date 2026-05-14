"use client"

import { useState, useEffect, useRef } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface TickerItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

const initialItems: TickerItem[] = [
  { symbol: "USD/TRY", name: "Dolar", price: 38.45, change: 0, changePercent: 0 },
  { symbol: "EUR/TRY", name: "Euro", price: 41.18, change: 0, changePercent: 0 },
  { symbol: "BTC/USD", name: "Bitcoin", price: 68240, change: 0, changePercent: 0 },
  { symbol: "BIST100", name: "BIST 100", price: 10485, change: 0, changePercent: 0 },
  { symbol: "ETH/USD", name: "Ethereum", price: 3420, change: 0, changePercent: 0 },
  { symbol: "XAU/TRY", name: "Gram Altın", price: 2648, change: 0, changePercent: 0 },
]

function formatPrice(price: number, symbol: string): string {
  if (symbol.includes("BTC") || symbol.includes("ETH")) {
    return price.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  }
  return price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function MarketTicker() {
  const [items, setItems] = useState<TickerItem[]>(initialItems)
  const prevPrices = useRef<Record<string, number>>({})

  useEffect(() => {
    const initial: Record<string, number> = {}
    initialItems.forEach((item) => { initial[item.symbol] = item.price })
    prevPrices.current = initial

    const interval = setInterval(() => {
      setItems((prev) =>
        prev.map((item) => {
          const volatility = item.symbol.includes("BTC") || item.symbol.includes("ETH") ? 0.004 : 0.002
          const change = item.price * (Math.random() - 0.5) * volatility
          const newPrice = Math.max(item.price + change, 0.01)
          const changeValue = newPrice - prevPrices.current[item.symbol]
          const changePercentValue = (changeValue / prevPrices.current[item.symbol]) * 100
          prevPrices.current[item.symbol] = newPrice
          return {
            ...item,
            price: newPrice,
            change: changeValue,
            changePercent: changePercentValue,
          }
        })
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gray-950/90 backdrop-blur-md shadow-lg shadow-cyan-500/5">
      <div className="flex ticker-scroll">
        <div className="flex ticker-content gap-0">
          {[...items, ...items, ...items].map((item, i) => {
            const isUp = item.change >= 0
            return (
              <div
                key={`${item.symbol}-${i}`}
                className="flex items-center gap-3 px-5 py-3 border-r border-cyan-500/10 min-w-fit whitespace-nowrap"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-gray-300">{item.symbol}</span>
                  <span className="text-[10px] text-gray-500">{item.name}</span>
                </div>
                <span className="text-sm font-bold text-white tabular-nums">
                  {formatPrice(item.price, item.symbol)}
                </span>
                <div className={`flex items-center gap-1 ${isUp ? "text-emerald-400" : "text-red-400"}`}>
                  {isUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  <span className="text-xs font-medium tabular-nums">
                    {item.changePercent > 0 ? "+" : ""}
                    {item.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        .ticker-scroll {
          overflow: hidden;
          mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 5%, black 95%, transparent);
        }
        .ticker-content {
          animation: ticker 60s linear infinite;
        }
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  )
}
