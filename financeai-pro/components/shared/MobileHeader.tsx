"use client"

import React from "react"
import { 
  Menu, 
  ChevronLeft, 
  Settings, 
  Bell,
  Search
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "next/navigation"

export function MobileHeader() {
  const pathname = usePathname()
  const router = useRouter()
  
  const isHome = pathname === "/dashboard"
  const title = pathname?.split("/").pop()?.replace("-", " ") || "FinanceAI"

  return (
    <header className="lg:hidden sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-primary/10 px-4 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {!isHome ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="h-9 w-9 text-muted-foreground hover:text-white"
          >
            <ChevronLeft size={20} />
          </Button>
        ) : (
          <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20">
            F
          </div>
        )}
        <h1 className="text-sm font-bold capitalize tracking-tight text-white">
          {isHome ? "FinanceAI Pro" : title}
        </h1>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
          <Search size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground relative">
          <Bell size={18} />
          <span className="absolute top-2 right-2 h-2 w-2 bg-emerald-500 rounded-full border-2 border-background" />
        </Button>
        <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
          <Menu size={20} />
        </Button>
      </div>
    </header>
  )
}
