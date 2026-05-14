import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPercentage(value: number, decimals = 1): string {
  return `%${value.toFixed(decimals)}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "long" }).format(date)
}

export function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date)
}

export function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
  }).format(date)
}

export const CATEGORY_LABELS: Record<string, string> = {
  SALARY: "Maaş",
  FREELANCE: "Freelance Geliri",
  INVESTMENT: "Yatırım Geliri",
  RENT: "Kira Gideri",
  UTILITIES: "Faturalar",
  GROCERIES: "Market Alışverişi",
  DINING: "Dışarıda Yemek",
  TRANSPORTATION: "Ulaşım",
  HEALTHCARE: "Sağlık",
  ENTERTAINMENT: "Eğlence",
  SHOPPING: "Alışveriş",
  EDUCATION: "Eğitim",
  SAVINGS: "Tasarruf",
  INSURANCE: "Sigorta",
  DEBT_PAYMENT: "Borç Ödeme",
  OTHER: "Diğer",
}

export const TYPE_LABELS: Record<string, string> = {
  INCOME: "Gelir",
  EXPENSE: "Gider",
  TRANSFER: "Transfer",
}

export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return "Mükemmel"
  if (score >= 60) return "İyi"
  if (score >= 40) return "Orta"
  return "İyileştirilmeli"
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return "#10b981"
  if (score >= 60) return "#f59e0b"
  return "#ef4444"
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).substring(2, 15)
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function truncate(str: string, length = 100): string {
  if (str.length <= length) return str
  return str.substring(0, length) + "..."
}

export function parseError(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return "Beklenmeyen bir hata oluştu"
}
