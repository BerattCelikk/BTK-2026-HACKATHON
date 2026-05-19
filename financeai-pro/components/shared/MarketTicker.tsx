"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { TrendingUp, TrendingDown, RefreshCcw, AlertTriangle, Radio } from "lucide-react"
import { TickerItem, MarketDataResponse } from "@/types"
import { wsClient } from "@/lib/websocket-client"

function formatPrice(price: number, symbol: string): string {
  if (symbol.includes("BTC") || symbol.includes("ETH")) {
    return price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  }
  return price.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function MarketTicker() {
  const [data, setData] = useState<MarketDataResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)
  const [priceFlash, setPriceFlash] = useState<Record<string, "up" | "down" | null>>({})
  
  const prevPrices = useRef<Record<string, number>>({})

  const fetchMarketData = useCallback(async () => {
    try {
      const res = await fetch("/api/market-data")
      if (!res.ok) throw new Error("Market data fetch failed")
      const result: MarketDataResponse = await res.json()
      setData(result)
      
      // Store initial prices
      result.items.forEach(item => {
        prevPrices.current[item.symbol] = item.price
      })
      
      setError(null)
    } catch (err) {
      console.error("Failed to fetch market data:", err)
      setError("Piyasa verileri güncellenemedi")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMarketData()
    
    // Connect to simulated WebSocket
    wsClient.connect()
    setIsLive(true)

    const handleMarketUpdate = (updates: any[]) => {
      setData(prev => {
        if (!prev) return prev
        
        const newFlash: Record<string, "up" | "down" | null> = {}
        const newItems = prev.items.map(item => {
          const update = updates.find(u => u.symbol === item.symbol)
          if (update) {
            const oldPrice = prevPrices.current[item.symbol] || item.price
            if (update.price > oldPrice) newFlash[item.symbol] = "up"
            else if (update.price < oldPrice) newFlash[item.symbol] = "down"
            
            prevPrices.current[item.symbol] = update.price
            return { ...item, price: update.price }
          }
          return item
        })
        
        setPriceFlash(newFlash)
        // Clear flash after 1s
        setTimeout(() => setPriceFlash({}), 1000)
        
        return { ...prev, items: newItems, lastUpdated: new Date().toISOString() }
      })
    }

    wsClient.on("market-price-update", handleMarketUpdate)
    
    return () => {
      wsClient.off("market-price-update", handleMarketUpdate)
      wsClient.disconnect()
    }
  }, [fetchMarketData])

  if (loading && !data) {
    return (
      <div className="h-12 w-full animate-pulse rounded-xl border border-cyan-500/20 bg-gray-950/90 flex items-center justify-center">
        <RefreshCcw className="h-4 w-4 animate-spin text-cyan-500 mr-2" />
        <span className="text-xs text-cyan-500/50 uppercase tracking-widest font-bold">Piyasalar yükleniyor...</span>
      </div>
    )
  }

  const items = data?.items || []
  const lastUpdated = data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString("tr-TR") : null

  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-xl border border-cyan-500/20 bg-gray-950/90 backdrop-blur-md shadow-lg shadow-cyan-500/5">
        <div className="flex ticker-scroll">
          <div className="flex ticker-content gap-0">
            {[...items, ...items, ...items].map((item, i) => {
              const isUp = item.changePercent >= 0
              const flash = priceFlash[item.symbol]
              
              return (
                <div
                  key={`${item.symbol}-${i}`}
                  className={`flex items-center gap-3 px-5 py-3 border-r border-cyan-500/10 min-w-fit whitespace-nowrap transition-colors duration-500 ${
                    flash === "up" ? "bg-emerald-500/10" : flash === "down" ? "bg-red-500/10" : ""
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-300">{item.symbol}</span>
                    <span className="text-[10px] text-gray-500">{item.name}</span>
                  </div>
                  <span className={`text-sm font-bold tabular-nums transition-colors duration-500 ${
                    flash === "up" ? "text-emerald-400" : flash === "down" ? "text-red-400" : "text-white"
                  }`}>
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
      
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          {isLive && (
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">LIVE</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-1 text-[10px] text-red-400">
              <AlertTriangle className="h-3 w-3" />
              <span>{error}</span>
            </div>
          )}
          {data && (data as any).isStale && (
            <div className="flex items-center gap-1 text-[10px] text-yellow-400">
              <AlertTriangle className="h-3 w-3" />
              <span>Gecikmeli veri</span>
            </div>
          )}
        </div>
        
        {lastUpdated && (
          <div className="text-[10px] text-gray-500 flex items-center gap-1">
            <RefreshCcw className="h-2.5 w-2.5" />
            Son Güncelleme: {lastUpdated}
          </div>
        )}
      </div>
    </div>
  )
}
