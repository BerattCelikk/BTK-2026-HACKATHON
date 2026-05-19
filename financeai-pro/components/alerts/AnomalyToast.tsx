"use client"

import React, { useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X } from "lucide-react"
import { AnomalyResult } from "@/types"
import { cn } from "@/lib/utils"

interface AnomalyToastProps {
  anomaly: AnomalyResult
  onDismiss: () => void
}

export const AnomalyToast: React.FC<AnomalyToastProps> = ({ anomaly, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss()
    }, 8000)

    return () => clearTimeout(timer)
  }, [onDismiss])

  const getSeverityStyles = (severity: number) => {
    if (severity >= 8) return "bg-red-950 border-red-500 text-red-200"
    if (severity >= 5) return "bg-yellow-950 border-yellow-500 text-yellow-200"
    return "bg-blue-950 border-blue-500 text-blue-200"
  }

  const getIconColor = (severity: number) => {
    if (severity >= 8) return "text-red-500"
    if (severity >= 5) return "text-yellow-500"
    return "text-blue-500"
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 50, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(
        "flex items-start gap-4 p-4 mb-3 rounded-lg border shadow-lg max-w-md pointer-events-auto",
        getSeverityStyles(anomaly.severity)
      )}
    >
      <div className={cn("mt-1", getIconColor(anomaly.severity))}>
        <AlertTriangle size={20} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider opacity-70">
            Anomali Tespit Edildi
          </span>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/10">
            Skor: {anomaly.severity}/10
          </span>
        </div>
        <p className="text-sm font-medium leading-tight">
          {anomaly.message}
        </p>
      </div>

      <button 
        onClick={onDismiss}
        className="mt-1 opacity-50 hover:opacity-100 transition-opacity"
      >
        <X size={18} />
      </button>
    </motion.div>
  )
}
