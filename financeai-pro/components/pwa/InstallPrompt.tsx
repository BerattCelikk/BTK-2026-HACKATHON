"use client"

import React, { useState, useEffect } from "react"
import { X, Smartphone, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      
      // Check if user has dismissed it recently
      const dismissed = localStorage.getItem("pwa-prompt-dismissed")
      const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      
      if (!dismissed || parseInt(dismissed) < oneWeekAgo) {
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handler)

    // Also detect if already in standalone mode
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowPrompt(false)
    }

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === "accepted") {
      setShowPrompt(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString())
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 left-4 right-4 z-[100] md:left-auto md:right-6 md:w-96"
        >
          <div className="bg-gray-900/90 backdrop-blur-xl border border-primary/30 rounded-2xl p-4 shadow-2xl shadow-primary/20">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Smartphone className="text-primary h-6 w-6" />
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-bold text-white">Uygulamayı Yükle</h4>
                  <button onClick={handleDismiss} className="text-gray-500 hover:text-white">
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  FinanceAI Pro'yu ana ekranına ekleyerek daha hızlı erişim sağlayabilir ve otonom bildirimler alabilirsin.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={handleInstall}
                    className="flex-1 bg-primary hover:bg-primary/90 text-[10px] font-bold uppercase tracking-widest gap-2"
                  >
                    <Download size={14} /> Şimdi Yükle
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
