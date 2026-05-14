// Seed script for demo data
// Run with: npx tsx prisma/seed/index.ts
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const user = await prisma.user.upsert({
    where: { email: "demo@financeai.com" },
    update: {},
    create: {
      email: "demo@financeai.com",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      monthlyIncome: 25000,
      riskProfile: "MODERATE",
      onboardingComplete: true,
    },
  })

  console.log("Created demo user:", user.id)

  const transactions = [
    { type: "INCOME", category: "SALARY", amount: 25000, description: "Maaş" },
    { type: "EXPENSE", category: "RENT", amount: 8000, description: "Kira" },
    { type: "EXPENSE", category: "UTILITIES", amount: 1500, description: "Faturalar" },
    { type: "EXPENSE", category: "GROCERIES", amount: 4000, description: "Market" },
    { type: "EXPENSE", category: "DINING", amount: 2000, description: "Dışarıda yemek" },
    { type: "EXPENSE", category: "TRANSPORTATION", amount: 1500, description: "Ulaşım" },
    { type: "EXPENSE", category: "ENTERTAINMENT", amount: 1000, description: "Eğlence" },
    { type: "SAVINGS", category: "SAVINGS", amount: 5000, description: "Tasarruf" },
  ]

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: tx.type as any,
        category: tx.category as any,
        amount: tx.amount,
        description: tx.description,
        date: new Date(),
      },
    })
  }

  console.log("Created transactions")

  await prisma.financialGoal.createMany({
    data: [
      {
        userId: user.id,
        title: "Acil Durum Fonu",
        description: "6 aylık gider kadar acil durum fonu",
        targetAmount: 90000,
        currentAmount: 25000,
        status: "ACTIVE",
      },
      {
        userId: user.id,
        title: "Yazlık Ev",
        description: "Yazlık ev için birikim",
        targetAmount: 500000,
        currentAmount: 75000,
        status: "ACTIVE",
      },
    ],
  })

  console.log("Created financial goals")

  await prisma.debt.createMany({
    data: [
      {
        userId: user.id,
        name: "Kredi Kartı",
        totalAmount: 15000,
        remainingAmount: 12000,
        interestRate: 24.0,
        minimumPayment: 1500,
        strategy: "snowball",
      },
      {
        userId: user.id,
        name: "İhtiyaç Kredisi",
        totalAmount: 50000,
        remainingAmount: 35000,
        interestRate: 18.0,
        minimumPayment: 2000,
        strategy: "snowball",
      },
    ],
  })

  console.log("Created debts")
  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.\()
  })
