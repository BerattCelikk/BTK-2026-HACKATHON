"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Wallet, Plus, Target, TrendingDown, PiggyBank, Sparkles, RefreshCw, Upload, Scan, Image, CheckCircle2, AlertCircle, X, FileSpreadsheet } from "lucide-react"
import { BudgetChart } from "@/components/charts"

function formatTL(amount: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", minimumFractionDigits: 0 }).format(amount)
}

interface BudgetData {
  totalIncome: number
  totalExpenses: number
  netSavings: number
  budgets: { name: string; planned: number; actual: number }[]
  activeBudgets: number
}

export default function BudgetPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [data, setData] = useState<BudgetData | null>(null)
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [scanResult, setScanResult] = useState<{ amount: number; category: string; description: string } | null>(null)
  const [scanError, setScanError] = useState<string | null>(null)

  const [formType, setFormType] = useState<"INCOME" | "EXPENSE">("EXPENSE")
  const [formCategory, setFormCategory] = useState("")
  const [formAmount, setFormAmount] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const categoryOptions = [
    { value: "SALARY", label: "Maaş" },
    { value: "FREELANCE", label: "Freelance" },
    { value: "INVESTMENT", label: "Yatırım" },
    { value: "RENT", label: "Kira" },
    { value: "UTILITIES", label: "Faturalar" },
    { value: "GROCERIES", label: "Market" },
    { value: "DINING", label: "Dışarıda Yemek" },
    { value: "TRANSPORTATION", label: "Ulaşım" },
    { value: "HEALTHCARE", label: "Sağlık" },
    { value: "ENTERTAINMENT", label: "Eğlence" },
    { value: "SHOPPING", label: "Alışveriş" },
    { value: "EDUCATION", label: "Eğitim" },
    { value: "SAVINGS", label: "Tasarruf" },
    { value: "INSURANCE", label: "Sigorta" },
    { value: "DEBT_PAYMENT", label: "Borç Ödeme" },
    { value: "OTHER", label: "Diğer" },
  ]

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)

    const parsedAmount = Number(formAmount)
    if (!formAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setSubmitError("Geçerli bir tutar girin")
      return
    }
    if (!formCategory) {
      setSubmitError("Kategori seçin")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: formType,
          category: formCategory,
          amount: parsedAmount,
          description: formDescription,
          date: new Date().toISOString(),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "İşlem başarısız")
      }
      setSubmitSuccess(true)
      setFormAmount("")
      setFormCategory("")
      setFormDescription("")
      fetchBudgetData()
      router.refresh()
      setTimeout(() => setSubmitSuccess(false), 3000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Bir hata oluştu")
    } finally {
      setSubmitting(false)
    }
  }

  const fetchBudgetData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/budget")
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    } catch (error) {
      console.error("Budget fetch error:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgetData()
  }, [fetchBudgetData])

  const handleRefresh = () => {
    router.refresh()
    fetchBudgetData()
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) processFile(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const processFile = (file: File) => {
    setScanResult(null)
    setScanError(null)
    const reader = new FileReader()
    reader.onload = (e) => setPreviewUrl(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleScan = async () => {
    if (!previewUrl) return
    setScanning(true)
    setScanError(null)
    setScanResult(null)
    try {
      const base64 = previewUrl.split(",")[1]
      const blob = await fetch(previewUrl).then((r) => r.blob())
      const formData = new FormData()
      formData.append("image", blob, "receipt.jpg")
      const res = await fetch("/api/vision/receipt", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) {
        setScanError(data.error || "Analiz başarısız")
        return
      }
      setScanResult(data.transaction)
      fetchBudgetData()
    } catch (err) {
      setScanError("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setScanning(false)
    }
  }

  const clearScan = () => {
    setPreviewUrl(null)
    setScanResult(null)
    setScanError(null)
  }

  const overviewStats = data
    ? [
        { label: "Toplam Gelir", amount: formatTL(data.totalIncome), icon: Wallet, color: "text-emerald-400" },
        { label: "Toplam Gider", amount: formatTL(data.totalExpenses), icon: TrendingDown, color: "text-red-400" },
        { label: "Net Tasarruf", amount: formatTL(data.netSavings), icon: PiggyBank, color: "text-blue-400" },
      ]
    : [
        { label: "Toplam Gelir", amount: "0 TL", icon: Wallet, color: "text-emerald-400" },
        { label: "Toplam Gider", amount: "0 TL", icon: TrendingDown, color: "text-red-400" },
        { label: "Net Tasarruf", amount: "0 TL", icon: PiggyBank, color: "text-blue-400" },
      ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Bütçe Yönetimi</h1>
          <p className="text-gray-400 mt-1">Gelir ve giderlerinizi takip edin</p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/export/transactions"
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 px-3 py-2 text-sm font-medium text-cyan-400 hover:bg-cyan-500/10 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV İndir
          </a>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
            className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
            <Plus className="h-4 w-4" />
            Yeni Bütçe
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900/60 border border-cyan-500/10">
          <TabsTrigger value="overview" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Genel Bakış</TabsTrigger>
          <TabsTrigger value="add" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Gelir/Gider Ekle</TabsTrigger>
          <TabsTrigger value="goals" className="data-[state=active]:bg-cyan-500/10 data-[state=active]:text-cyan-400">Hedefler</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {overviewStats.map((stat) => (
              <Card key={stat.label} className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-400">{stat.label}</p>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  {loading ? (
                    <Skeleton className="h-8 w-24 bg-gray-700/50" />
                  ) : (
                    <p className={`text-2xl font-bold ${data && data.netSavings >= 0 ? "text-white" : "text-red-400"}`}>
                      {stat.amount}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {data && data.budgets.length > 0 && (
            <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
              <CardHeader>
                <CardTitle className="text-lg text-white">Bütçe Karşılaştırması</CardTitle>
                <CardDescription className="text-gray-400">Planlanan vs Gerçekleşen harcamalar</CardDescription>
              </CardHeader>
              <CardContent>
                <BudgetChart data={data.budgets} />
              </CardContent>
            </Card>
          )}

          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5 text-emerald-400" />
                AI Bütçe Önerileri
              </CardTitle>
              <CardDescription className="text-gray-400">
                AI asistanınıza danışarak kişiselleştirilmiş bütçe planı oluşturun
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  "50/30/20 kuralını uygulayarak bütçenizi optimize edin",
                  "Aylık harcama limitleri belirleyin",
                  "Tasarruf hedeflerinize göre otomatik bütçe oluşturun",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-lg bg-gray-800/50 border border-cyan-500/10 p-3">
                    <div className="h-2 w-2 mt-2 rounded-full bg-emerald-500 shrink-0" />
                    <p className="text-sm text-gray-400">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <CardHeader>
              <CardTitle className="text-white">Gelir veya Gider Ekle</CardTitle>
              <CardDescription className="text-gray-400">Finansal işlemlerinizi kaydedin</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTransaction} className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <Button
                    type="button"
                    variant={formType === "INCOME" ? "default" : "outline"}
                    onClick={() => { setFormType("INCOME"); setSubmitError(null); setSubmitSuccess(false) }}
                    className={`flex-1 ${
                      formType === "INCOME"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                        : "border-cyan-500/20 text-gray-300 hover:bg-cyan-500/5"
                    }`}
                  >
                    Gelir
                  </Button>
                  <Button
                    type="button"
                    variant={formType === "EXPENSE" ? "default" : "outline"}
                    onClick={() => { setFormType("EXPENSE"); setSubmitError(null); setSubmitSuccess(false) }}
                    className={`flex-1 ${
                      formType === "EXPENSE"
                        ? "bg-gradient-to-r from-red-500 to-rose-600"
                        : "border-cyan-500/20 text-gray-300 hover:bg-cyan-500/5"
                    }`}
                  >
                    Gider
                  </Button>
                </div>

                {submitSuccess && (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-3">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <p className="text-sm text-emerald-300">
                      {formType === "INCOME" ? "Gelir" : "Gider"} başarıyla eklendi!
                    </p>
                  </div>
                )}

                {submitError && (
                  <div className="flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-red-300">{submitError}</p>
                  </div>
                )}

                <Input
                  placeholder="Tutar (TL)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formAmount}
                  onChange={(e) => { setFormAmount(e.target.value); setSubmitError(null); setSubmitSuccess(false) }}
                  className="bg-gray-800/50 border-cyan-500/20 text-white"
                />

                <select
                  value={formCategory}
                  onChange={(e) => { setFormCategory(e.target.value); setSubmitError(null); setSubmitSuccess(false) }}
                  className="flex h-10 w-full rounded-lg border border-cyan-500/20 bg-gray-800/50 px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  <option value="" className="bg-gray-900">Kategori seçin</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-gray-900">
                      {opt.label}
                    </option>
                  ))}
                </select>

                <Input
                  placeholder="Açıklama (isteğe bağlı)"
                  maxLength={200}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="bg-gray-800/50 border-cyan-500/20 text-white"
                />

                <div className="flex justify-end">
                  <span className="text-[10px] text-gray-600">{formDescription.length}/200</span>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  {submitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Ekleniyor...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      {formType === "INCOME" ? "Gelir Ekle" : "Gider Ekle"}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Scan className="h-5 w-5 text-emerald-400" />
                Fiş/Fatura Okut
              </CardTitle>
              <CardDescription className="text-gray-400">
                AI ile fiş görselinizden otomatik veri çıkarma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!previewUrl ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                  className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all cursor-pointer ${
                    dragOver
                      ? "border-emerald-400 bg-emerald-500/10"
                      : "border-cyan-500/50 bg-gray-900/40 hover:border-cyan-400/70 hover:bg-gray-900/60"
                  }`}
                  onClick={() => document.getElementById("receipt-input")?.click()}
                >
                  <Upload className="h-10 w-10 text-cyan-400 mb-3" />
                  <p className="text-sm font-medium text-gray-300">Fiş/Fatura Yükle</p>
                  <p className="text-xs text-gray-500 mt-1">Sürükle bırak veya tıkla</p>
                  <p className="text-[10px] text-gray-600 mt-2">PNG, JPG, WEBP</p>
                  <input
                    id="receipt-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-xl overflow-hidden border border-cyan-500/20">
                    <img src={previewUrl} alt="Receipt preview" className="w-full max-h-48 object-contain bg-gray-900/60" />
                    <button
                      onClick={clearScan}
                      className="absolute top-2 right-2 rounded-full bg-gray-900/80 p-1.5 text-gray-400 hover:text-white transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {scanError && (
                    <div className="flex items-start gap-3 rounded-lg bg-red-500/10 border border-red-500/30 p-3">
                      <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-red-300">{scanError}</p>
                    </div>
                  )}

                  {scanResult && (
                    <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm font-medium text-emerald-400">Veri Çıkarıldı</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-gray-500">Tutar:</div>
                        <div className="text-white font-medium text-right">
                          {scanResult.amount.toLocaleString("tr-TR")} TL
                        </div>
                        <div className="text-gray-500">Kategori:</div>
                        <div className="text-white font-medium text-right">{scanResult.category}</div>
                        <div className="text-gray-500">Açıklama:</div>
                        <div className="text-white font-medium text-right truncate">{scanResult.description}</div>
                      </div>
                    </div>
                  )}

                  {!scanResult && !scanError && (
                    <Button
                      onClick={handleScan}
                      disabled={scanning}
                      className="w-full gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                    >
                      {scanning ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Analiz Ediliyor...
                        </>
                      ) : (
                        <>
                          <Scan className="h-4 w-4" />
                          Analiz Et
                        </>
                      )}
                    </Button>
                  )}

                  {scanResult && (
                    <Button
                      onClick={clearScan}
                      variant="outline"
                      className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      Yeni Fiş Tara
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5 text-emerald-400" />
                Finansal Hedefler
              </CardTitle>
              <CardDescription className="text-gray-400">Hedeflerinize ulaşmak için plan oluşturun</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Henüz hedef eklenmemiş</p>
                <Button variant="outline" className="mt-4 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/5">Hedef Ekle</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
