import { ClerkProvider } from "@clerk/nextjs"
import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { ThemeProvider } from "next-themes"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { MobileBottomNav } from "@/components/shared/MobileBottomNav"
import { MobileHeader } from "@/components/shared/MobileHeader"
import { InstallPrompt } from "@/components/pwa/InstallPrompt"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "FinanceAI Pro - AI-Powered Financial Advisor",
  description: "Multi-agent AI financial advisory platform powered by Google Gemini",
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const messages = await getMessages()

  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#10b981",
          colorText: "#f9fafb",
          colorBackground: "#030712",
          colorInputBackground: "#1f2937",
          colorInputText: "#f9fafb",
          colorNeutral: "#9ca3af",
        },
      }}
    >
      <html lang={locale} suppressHydrationWarning>
        <body className="min-h-screen bg-background antialiased pb-16 lg:pb-0">
          <ThemeProvider attribute="class" defaultTheme="dark" storageKey="theme" enableSystem>
            <NextIntlClientProvider messages={messages}>
              <ThemeToggle />
              <MobileHeader />
              <main className="flex-1">
                {children}
              </main>
              <MobileBottomNav />
              <InstallPrompt />
            </NextIntlClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
