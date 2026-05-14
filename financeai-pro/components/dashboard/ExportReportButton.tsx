"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function ExportReportButton() {
  return (
    <Button
      onClick={() => window.print()}
      className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 no-print"
    >
      <Download className="h-4 w-4" />
      Raporu İndir
    </Button>
  )
}
