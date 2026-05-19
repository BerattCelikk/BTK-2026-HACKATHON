import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function generatePDFReport(elementId: string, filename: string = "finance-report.pdf") {
  const element = document.getElementById(elementId)
  if (!element) return

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#030712"
  })

  const imgData = canvas.toDataURL("image/png")
  const pdf = new jsPDF("p", "mm", "a4")
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
  
  // Add Footer
  pdf.setFontSize(8)
  pdf.setTextColor(150)
  pdf.text("FinanceAI Pro - Kişiselleştirilmiş Finansal Analiz Raporu", 10, pdf.internal.pageSize.getHeight() - 10)
  
  pdf.save(filename)
}

export function generateCSVReport(data: any[], filename: string = "finance-data.csv") {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(","),
    ...data.map(row => headers.map(h => JSON.stringify(row[h])).join(","))
  ].join("\n")

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}
