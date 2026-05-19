import { financialRAG } from "../../lib/rag"

async function main() {
  try {
    console.log("Starting Knowledge Base seeding...")
    await financialRAG.seedKnowledgeBase()
    console.log("Knowledge Base seeding completed successfully.")
  } catch (error) {
    console.error("Error seeding Knowledge Base:", error)
    process.exit(1)
  }
}

main()
