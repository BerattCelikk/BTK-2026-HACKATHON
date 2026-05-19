"use client"

import React, { useState } from "react"
import { Calendar as CalendarIcon, Search, X, Filter } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { TransactionFilterState, initialFilterState } from "@/lib/transaction-filters"

const CATEGORIES = [
  "SALARY", "FREELANCE", "INVESTMENT", "RENT", "UTILITIES", 
  "GROCERIES", "DINING", "TRANSPORTATION", "HEALTHCARE", 
  "ENTERTAINMENT", "SHOPPING", "EDUCATION", "SAVINGS", 
  "INSURANCE", "DEBT_PAYMENT", "OTHER"
]

interface TransactionFiltersProps {
  onFilterChange: (filters: TransactionFilterState) => void
}

export function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<TransactionFilterState>(initialFilterState)

  const handleDateChange = (range: DateRange | undefined) => {
    const newFilters = { 
      ...filters, 
      dateRange: { from: range?.from, to: range?.to } 
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category]
    
    const newFilters = { ...filters, categories: newCategories }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFilters = { ...filters, search: e.target.value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const resetFilters = () => {
    setFilters(initialFilterState)
    onFilterChange(initialFilterState)
  }

  const removeCategory = (cat: string) => toggleCategory(cat)
  const removeDate = () => handleDateChange(undefined)

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="İşlem veya kategori ara..." 
            className="pl-9 bg-background/50 border-primary/20"
            value={filters.search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Date Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal bg-background/50 border-primary/20",
                !filters.dateRange.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, "LLL dd, y", { locale: tr })} -{" "}
                    {format(filters.dateRange.to, "LLL dd, y", { locale: tr })}
                  </>
                ) : (
                  format(filters.dateRange.from, "LLL dd, y", { locale: tr })
                )
              ) : (
                <span>Tarih aralığı</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-primary/20" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange.from}
              selected={{ from: filters.dateRange.from, to: filters.dateRange.to }}
              onSelect={handleDateChange}
              numberOfMonths={2}
              locale={tr}
            />
          </PopoverContent>
        </Popover>

        {/* Category Dropdown (Simulated with simple popover) */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="bg-background/50 border-primary/20">
              <Filter className="mr-2 h-4 w-4" />
              Kategoriler
              {filters.categories.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-none">
                  {filters.categories.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-4 border-primary/20 bg-background/95 backdrop-blur-md" align="start">
            <h4 className="font-bold text-sm mb-3 uppercase tracking-wider text-muted-foreground">Kategori Seçin</h4>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCategory(cat)}
                  className={cn(
                    "px-2 py-1 rounded-md text-[10px] font-bold border transition-all duration-200",
                    filters.categories.includes(cat)
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                      : "bg-muted/50 text-muted-foreground border-transparent hover:border-primary/40"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {(filters.search || filters.dateRange.from || filters.categories.length > 0) && (
          <Button variant="ghost" size="sm" onClick={resetFilters} className="text-muted-foreground hover:text-primary">
            Sıfırla
          </Button>
        )}
      </div>

      {/* Active Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {filters.dateRange.from && (
          <Badge variant="outline" className="gap-1 bg-primary/5 border-primary/30 px-2 py-1">
            {format(filters.dateRange.from, "dd.MM.yyyy")}
            {filters.dateRange.to && ` - ${format(filters.dateRange.to, "dd.MM.yyyy")}`}
            <X className="h-3 w-3 cursor-pointer hover:text-primary" onClick={removeDate} />
          </Badge>
        )}
        {filters.categories.map(cat => (
          <Badge key={cat} variant="outline" className="gap-1 bg-primary/5 border-primary/30 px-2 py-1">
            {cat}
            <X className="h-3 w-3 cursor-pointer hover:text-primary" onClick={() => removeCategory(cat)} />
          </Badge>
        ))}
      </div>
    </div>
  )
}
