import { Transaction } from "@prisma/client"
import { isWithinInterval, parseISO } from "date-fns"

export interface TransactionFilterState {
  dateRange: { from: Date | undefined; to: Date | undefined }
  categories: string[]
  amountRange: [number, number]
  search: string
}

export const initialFilterState: TransactionFilterState = {
  dateRange: { from: undefined, to: undefined },
  categories: [],
  amountRange: [0, 100000],
  search: ""
}

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilterState
): Transaction[] {
  return transactions.filter(t => {
    // 1. Date Filter
    if (filters.dateRange.from && filters.dateRange.to) {
      const tDate = new Date(t.date)
      if (!isWithinInterval(tDate, { start: filters.dateRange.from, end: filters.dateRange.to })) {
        return false
      }
    }

    // 2. Category Filter
    if (filters.categories.length > 0 && !filters.categories.includes(t.category)) {
      return false
    }

    // 3. Amount Filter
    if (t.amount < filters.amountRange[0] || t.amount > filters.amountRange[1]) {
      return false
    }

    // 4. Search Filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const descriptionMatch = t.description?.toLowerCase().includes(searchLower)
      const categoryMatch = t.category.toLowerCase().includes(searchLower)
      if (!descriptionMatch && !categoryMatch) {
        return false
      }
    }

    return true
  })
}

// Debounce helper
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
