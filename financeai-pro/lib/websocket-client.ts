import EventEmitter from "eventemitter3"

type RealtimeEvent = "market-price-update" | "anomaly-detected" | "transaction-added"

class WebSocketClient extends EventEmitter {
  private pollingInterval: NodeJS.Timeout | null = null
  private isConnected: boolean = false

  constructor() {
    super()
  }

  connect() {
    if (this.isConnected) return
    
    console.log("Connecting to simulated WebSocket...")
    this.isConnected = true
    this.startPolling()
    
    // Simulate initial connection success
    setTimeout(() => {
      this.emit("connection-success")
    }, 500)
  }

  disconnect() {
    this.stopPolling()
    this.isConnected = false
  }

  private startPolling() {
    // Poll every 10 seconds for simulated real-time updates
    this.pollingInterval = setInterval(async () => {
      await this.fetchUpdates()
    }, 10000)
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  private async fetchUpdates() {
    try {
      const response = await fetch("/api/realtime")
      if (!response.ok) throw new Error("Realtime update fetch failed")
      
      const data = await response.json()
      
      if (data.marketUpdates) {
        this.emit("market-price-update", data.marketUpdates)
      }
      
      if (data.newAnomalies && data.newAnomalies.length > 0) {
        data.newAnomalies.forEach((anomaly: any) => {
          this.emit("anomaly-detected", anomaly)
        })
      }
    } catch (error) {
      console.error("WebSocket simulation error:", error)
      this.emit("error", error)
    }
  }

  // Helper for manual triggers (e.g. after adding a transaction)
  trigger(event: RealtimeEvent, data: any) {
    this.emit(event, data)
  }
}

export const wsClient = new WebSocketClient()
