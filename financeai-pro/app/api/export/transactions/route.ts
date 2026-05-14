import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } })
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: dbUser.id },
      orderBy: { date: "desc" },
    })

    const headers = ["Tarih", "Tür", "Kategori", "Tutar", "Açıklama"]
    const rows = transactions.map((t) => [
      t.date.toISOString().split("T")[0],
      t.type === "INCOME" ? "Gelir" : t.type === "EXPENSE" ? "Gider" : "Transfer",
      t.category,
      t.amount.toLocaleString("tr-TR", { minimumFractionDigits: 2, useGrouping: false }),
      `"${(t.description || "").replace(/"/g, '""')}"`,
    ])

    const BOM = "\uFEFF"
    const csv = BOM + [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\r\n")

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="financeai_islemler_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("CSV export error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
