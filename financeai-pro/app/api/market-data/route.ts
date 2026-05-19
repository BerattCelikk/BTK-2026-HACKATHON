import { NextResponse } from "next/server"
import { TickerItem, MarketDataResponse } from "@/types"

// Cache market data for 5 minutes
let cache: { data: MarketDataResponse; timestamp: number } | null = null
const CACHE_TTL = 5 * 60 * 1000 

export async function GET() {
  const now = Date.now()

  if (cache && now - cache.timestamp < CACHE_TTL) {
    return NextResponse.json(cache.data)
  }

  try {
    // 1. Fetch Currencies (USD, EUR)
    // Using exchangerate-api.com free tier (no key needed)
    const currencyRes = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 300 } // Next.js level caching as well
    })
    const currencyData = await currencyRes.json()
    const usdTry = currencyData.rates.TRY
    const eurUsd = currencyData.rates.EUR
    const eurTry = usdTry / eurUsd

    // 2. Fetch Crypto (BTC, ETH)
    // CoinGecko free API (no key needed)
    const cryptoRes = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true", {
      next: { revalidate: 300 }
    })
    const cryptoData = await cryptoRes.json()

    // 3. BIST100 - Mocked with realistic range for hackathon (9000-11000)
    const bistBase = 10450
    const bistFluctuation = (Math.random() - 0.5) * 100
    const bistPrice = bistBase + bistFluctuation
    const bistChangePercent = (bistFluctuation / bistBase) * 100

    const items: TickerItem[] = [
      { 
        symbol: "USD/TRY", 
        name: "Dolar", 
        price: usdTry, 
        change: 0.12, // Mocked change
        changePercent: 0.35 
      },
      { 
        symbol: "EUR/TRY", 
        name: "Euro", 
        price: eurTry, 
        change: 0.08, 
        changePercent: 0.22 
      },
      { 
        symbol: "BTC/USD", 
        name: "Bitcoin", 
        price: cryptoData.bitcoin.usd, 
        change: cryptoData.bitcoin.usd * (cryptoData.bitcoin.usd_24h_change / 100), 
        changePercent: cryptoData.bitcoin.usd_24h_change 
      },
      { 
        symbol: "ETH/USD", 
        name: "Ethereum", 
        price: cryptoData.ethereum.usd, 
        change: cryptoData.ethereum.usd * (cryptoData.ethereum.usd_24h_change / 100), 
        changePercent: cryptoData.ethereum.usd_24h_change 
      },
      { 
        symbol: "BIST100", 
        name: "BIST 100", 
        price: bistPrice, 
        change: bistFluctuation, 
        changePercent: bistChangePercent 
      },
      { 
        symbol: "XAU/TRY", 
        name: "Gram Altın", 
        // Approx Gold price in TRY (USD Gold Price / 31.1035 * USD/TRY)
        price: (2350 / 31.1035) * usdTry, 
        change: 4.5, 
        changePercent: 0.18 
      },
    ]

    const responseData: MarketDataResponse = {
      items,
      lastUpdated: new Date().toISOString(),
      source: "Mixed (ExchangeRate-API, CoinGecko, Mock)"
    }

    cache = { data: responseData, timestamp: now }
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("[MarketData] Fetch error:", error)
    
    // Return stale cache if available
    if (cache) {
      return NextResponse.json({
        ...cache.data,
        isStale: true,
        error: "Failed to fetch fresh data, showing cached results"
      })
    }

    return NextResponse.json({ error: "Market data unavailable" }, { status: 503 })
  }
}
