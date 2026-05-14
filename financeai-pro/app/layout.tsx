import { ClerkProvider } from "@clerk/nextjs"
import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "FinanceAI Pro - AI-Powered Financial Advisor",
  description: "Multi-agent AI financial advisory platform powered by Google Gemini",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
      <html lang="tr" className="dark">
        <body className="min-h-screen bg-background antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
