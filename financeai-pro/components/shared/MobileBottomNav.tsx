"use client"

import React from "react"
import Link from "next/navigation"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  MessageSquare, 
  BarChart3, 
  Sparkles, 
  User,
  Bell
} from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Özet", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Asistan", icon: MessageSquare, href: "/chat" },
  { label: "Analiz", icon: BarChart3, href: "/analytics" },
  { label: "Öneriler", icon: Sparkles, href: "/recommendations" },
  { label: "Profil", icon: User, href: "/profile" },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-primary/10 px-2 pb-safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.includes(item.href)
          const Icon = item.icon
          
          return (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-all duration-300",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
              )}
            >
              <div className={cn(
                "p-1.5 rounded-xl transition-all duration-300",
                isActive ? "bg-primary/10 shadow-lg shadow-primary/5 scale-110" : ""
              )}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-tighter">
                {item.label}
              </span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}
