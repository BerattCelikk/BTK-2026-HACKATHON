"use client"

import React, { useState, useEffect, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { AnomalyToast } from "./AnomalyToast"
import { AnomalyResult } from "@/types"

export const AnomalyNotificationCenter: React.FC = () => {
  const [anomalies, setAnomalies] = useState<(AnomalyResult & { id: string })[]>([])

  const fetchAnomalies = useCallback(async () => {
    try {
      const response = await fetch("/api/alerts")
      if (!response.ok) throw new Error("Anomaliler alınamadı")
      
      const data = await response.json()
      
      if (data.anomalies && data.anomalies.length > 0) {
        // Add unique IDs to anomalies for React keys and tracking
        const newAnomalies = data.anomalies.map((a: AnomalyResult, index: number) => ({
          ...a,
          id: `${Date.now()}-${index}`
        }))
        
        setAnomalies(prev => [...prev, ...newAnomalies])
      }
    } catch (error) {
      console.error("Anomaly fetch error:", error)
    }
  }, [])

  useEffect(() => {
    fetchAnomalies()
    
    // Poll every 5 minutes
    const interval = setInterval(fetchAnomalies, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [fetchAnomalies])

  const dismissAnomaly = (id: string) => {
    setAnomalies(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] pointer-events-none flex flex-col items-end">
      <AnimatePresence>
        {anomalies.map((anomaly) => (
          <AnomalyToast 
            key={anomaly.id} 
            anomaly={anomaly} 
            onDismiss={() => dismissAnomaly(anomaly.id)} 
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
