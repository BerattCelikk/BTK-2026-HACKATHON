// Seed script for demo data
// Run with: npx tsx prisma/seed/index.ts
import "dotenv/config"
import prisma from "../../lib/prisma"
import { financialRAG } from "../../lib/rag"
import { embedText } from "../../lib/embedding"
import { KNOWLEDGE_BASE_ARTICLES } from "../../lib/knowledge-base"

async function seedKnowledgeBase() {
  console.log("\n📚 Seeding Knowledge Base with embeddings...")
  
  let successCount = 0
  let skipCount = 0
  let errorCount = 0
  
  for (const article of KNOWLEDGE_BASE_ARTICLES) {
    try {
      // Check if article already exists
      const existing = await prisma.knowledgeBase.findFirst({
        where: { title: article.title }
      })
      
      if (existing) {
        console.log(`  ⊘ Skipping "${article.title}" (already exists)`)
        skipCount++
        continue
      }
      
      // Generate embedding for article content
      console.log(`  ⏳ Embedding "${article.title}"...`)
      const embedding = await embedText(article.content)
      
      // Insert article with embedding into database
      // We use raw SQL because Prisma 7 still requires it for vector columns in create
      const vectorString = `[${embedding.join(",")}]`
      await prisma.$executeRaw`
        INSERT INTO "KnowledgeBase" (id, title, content, category, embedding, "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, ${article.title}, ${article.content}, ${article.category}, ${vectorString}::vector, NOW(), NOW())
      `
      
      console.log(`  ✓ Seeded "${article.title}"`)
      successCount++
      
      // Rate limiting: wait 1 second between embeddings to avoid API limits
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error(`  ✗ Failed to seed "${article.title}":`, error)
      errorCount++
    }
  }
  
  console.log(`\n📊 Knowledge Base Seeding Summary:`)
  console.log(`   ✓ Successfully seeded: ${successCount}`)
  console.log(`   ⊘ Skipped (already exist): ${skipCount}`)
  console.log(`   ✗ Errors: ${errorCount}`)
}

async function main() {
  console.log("Seeding database...")

  // Seed RAG Knowledge Base
  try {
    console.log("Seeding RAG Knowledge Base...")
    await financialRAG.seedKnowledgeBase()
    console.log("RAG Knowledge Base seeded.")
  } catch (error) {
    console.error("RAG seeding failed (continuing with other seeds):", error)
  }

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

  // Clear existing transactions for clean seed
  await prisma.transaction.deleteMany({ where: { userId: user.id } })

  const transactions = [
    // March 2026
    { date: new Date(2026, 2, 1), type: "INCOME", category: "SALARY", amount: 15000, description: "Aylık Maaş" },
    { date: new Date(2026, 2, 15), type: "INCOME", category: "FREELANCE", amount: 2500, description: "Freelance Proje" },
    { date: new Date(2026, 2, 2), type: "EXPENSE", category: "RENT", amount: 5000, description: "Ev Kirası" },
    { date: new Date(2026, 2, 5), type: "EXPENSE", category: "UTILITIES", amount: 450, description: "Elektrik Faturası" },
    { date: new Date(2026, 2, 5), type: "EXPENSE", category: "UTILITIES", amount: 120, description: "İnternet Faturası" },
    { date: new Date(2026, 2, 10), type: "EXPENSE", category: "GROCERIES", amount: 1200, description: "Market Alışverişi" },
    { date: new Date(2026, 2, 12), type: "EXPENSE", category: "DINING", amount: 350, description: "Restoran" },
    { date: new Date(2026, 2, 15), type: "EXPENSE", category: "TRANSPORTATION", amount: 300, description: "Benzin" },
    { date: new Date(2026, 2, 20), type: "EXPENSE", category: "ENTERTAINMENT", amount: 150, description: "Sinema" },
    { date: new Date(2026, 2, 25), type: "EXPENSE", category: "SHOPPING", amount: 800, description: "Kıyafet Alışverişi" },

    // April 2026
    { date: new Date(2026, 3, 1), type: "INCOME", category: "SALARY", amount: 15000, description: "Aylık Maaş" },
    { date: new Date(2026, 3, 10), type: "INCOME", category: "FREELANCE", amount: 3000, description: "Danışmanlık Geliri" },
    { date: new Date(2026, 3, 2), type: "EXPENSE", category: "RENT", amount: 5000, description: "Ev Kirası" },
    { date: new Date(2026, 3, 5), type: "EXPENSE", category: "UTILITIES", amount: 400, description: "Elektrik Faturası" },
    { date: new Date(2026, 3, 5), type: "EXPENSE", category: "UTILITIES", amount: 120, description: "İnternet" },
    { date: new Date(2026, 3, 8), type: "EXPENSE", category: "HEALTHCARE", amount: 250, description: "Doktor Ziyareti" },
    { date: new Date(2026, 3, 12), type: "EXPENSE", category: "GROCERIES", amount: 1100, description: "Market" },
    { date: new Date(2026, 3, 18), type: "EXPENSE", category: "DINING", amount: 450, description: "Restoran ve Kafe" },
    { date: new Date(2026, 3, 22), type: "EXPENSE", category: "TRANSPORTATION", amount: 280, description: "Benzin ve Taksi" },
    { date: new Date(2026, 3, 28), type: "EXPENSE", category: "EDUCATION", amount: 300, description: "Online Kurs" },

    // May 2026
    { date: new Date(2026, 4, 1), type: "INCOME", category: "SALARY", amount: 15000, description: "Aylık Maaş" },
    { date: new Date(2026, 4, 5), type: "INCOME", category: "FREELANCE", amount: 2000, description: "Freelance İşi" },
    { date: new Date(2026, 4, 20), type: "INCOME", category: "INVESTMENT", amount: 450, description: "Faiz Geliri" },
    { date: new Date(2026, 4, 2), type: "EXPENSE", category: "RENT", amount: 5000, description: "Ev Kirası" },
    { date: new Date(2026, 4, 5), type: "EXPENSE", category: "UTILITIES", amount: 380, description: "Elektrik" },
    { date: new Date(2026, 4, 5), type: "EXPENSE", category: "UTILITIES", amount: 120, description: "İnternet" },
    { date: new Date(2026, 4, 8), type: "EXPENSE", category: "INSURANCE", amount: 500, description: "Araç Sigortası" },
    { date: new Date(2026, 4, 10), type: "EXPENSE", category: "GROCERIES", amount: 1300, description: "Market" },
    { date: new Date(2026, 4, 15), type: "EXPENSE", category: "DINING", amount: 500, description: "Restoran" },
    { date: new Date(2026, 4, 16), type: "EXPENSE", category: "SHOPPING", amount: 1200, description: "Elektronik Alışverişi" },
    { date: new Date(2026, 4, 20), type: "EXPENSE", category: "TRANSPORTATION", amount: 320, description: "Benzin" },
  ]

  for (const tx of transactions) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        type: tx.type as any,
        category: tx.category as any,
        amount: tx.amount,
        description: tx.description,
        date: tx.date,
      },
    })
  }

  console.log(`Created ${transactions.length} transactions across 3 months`)

  await prisma.financialGoal.deleteMany({ where: { userId: user.id } })
  await prisma.financialGoal.createMany({
    data: [
      {
        userId: user.id,
        title: "Acil Durum Fonu",
        description: "6 aylık gider kadar acil durum fonu birikimi",
        targetAmount: 90000,
        currentAmount: 25000,
        status: "ACTIVE",
      },
      {
        userId: user.id,
        title: "Yazlık Ev",
        description: "Yazlık ev için birikim hedefi",
        targetAmount: 500000,
        currentAmount: 75000,
        status: "ACTIVE",
      },
    ],
  })

  console.log("Created financial goals")

  await prisma.debt.deleteMany({ where: { userId: user.id } })
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
  
  // Seed Knowledge Base
  await seedKnowledgeBase()
  
  console.log("Database seeded successfully!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
