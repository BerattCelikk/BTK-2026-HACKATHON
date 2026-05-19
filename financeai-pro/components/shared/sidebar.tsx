"use client"

import { Link, usePathname, useRouter } from "@/lib/navigation"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  GraduationCap,
  CreditCard,
  Bot,
  Menu,
  X,
  Languages,
} from "lucide-react"
import { useState } from "react"

export function Sidebar() {
  const t = useTranslations("Common")
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  const navItems = [
    { href: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { href: "/budget", label: t("budget"), icon: Wallet },
    { href: "/invest", label: t("invest"), icon: TrendingUp },
    { href: "/learn", label: t("learn"), icon: GraduationCap },
    { href: "/debt", label: t("debt"), icon: CreditCard },
  ]

  const toggleLanguage = () => {
    const nextLocale = locale === "tr" ? "en" : "tr"
    router.replace(pathname, { locale: nextLocale })
  }

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden text-white"
      >
        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-800 bg-gray-950 transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 p-6 border-b border-gray-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">FinanceAI</h1>
              <p className="text-xs text-emerald-400">Pro</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-emerald-600/10 text-emerald-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-gray-800 p-4 space-y-4">
            <button
              onClick={toggleLanguage}
              className="flex w-full items-center justify-between rounded-lg border border-gray-800 px-3 py-2 text-xs font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                <span>{locale === "tr" ? "English" : "Türkçe"}</span>
              </div>
              <span className="text-[10px] uppercase font-bold opacity-50">{locale}</span>
            </button>

            <div className="rounded-lg bg-gradient-to-r from-emerald-600/10 to-teal-600/10 p-3">
              <p className="text-xs text-emerald-400 mb-1">AI Asistan</p>
              <p className="text-xs text-gray-400">
                {locale === "tr" ? "5 uzman finansal danışman" : "5 expert financial advisors"}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-gray-800 bg-gray-950 px-4 lg:hidden">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
          <Bot className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-white">FinanceAI Pro</span>
      </div>
    </header>
  )
}
