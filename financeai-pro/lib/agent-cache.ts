interface CacheEntry<T> {
  value: T
  expiry: number
}

class AgentCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly DEFAULT_TTL = 300 * 1000 // 5 minutes in ms
  private readonly MAX_ENTRIES = 1000

  constructor() {
    // Periodic cleanup every minute
    if (typeof window === "undefined") {
      setInterval(() => this.cleanup(), 60 * 1000)
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiry) {
      this.cache.delete(key)
      return null
    }

    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs?: number) {
    if (this.cache.size >= this.MAX_ENTRIES) {
      // Evict oldest entry (first key in Map)
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlMs || this.DEFAULT_TTL)
    })
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }

  private cleanup() {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key)
      }
    }
  }
}

export const agentCache = new AgentCache()
