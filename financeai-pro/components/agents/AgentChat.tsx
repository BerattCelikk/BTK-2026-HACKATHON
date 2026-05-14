"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react"
import type { Message, AgentType } from "@/types"

const agentColors: Record<AgentType, string> = {
  financial_analyst: "from-blue-500 to-cyan-500",
  investment_advisor: "from-purple-500 to-pink-500",
  budget_optimizer: "from-emerald-500 to-teal-500",
  education_agent: "from-yellow-500 to-orange-500",
  debt_manager: "from-red-500 to-rose-500",
  orchestrator: "from-emerald-500 to-teal-600",
}

const agentLabels: Record<AgentType, string> = {
  financial_analyst: "Finansal Analist",
  investment_advisor: "Yatırım Danışmanı",
  budget_optimizer: "Bütçe Uzmanı",
  education_agent: "Eğitim Asistanı",
  debt_manager: "Borç Yöneticisi",
  orchestrator: "AI Danışman",
}

interface AgentChatProps {
  userId?: string
}

export function AgentChat({ userId }: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Merhaba! Ben FinanceAI Pro yapay zeka finansal danışmanınız. Size nasıl yardımcı olabilirim?\n\n**Şu konularda yardım edebilirim:**\n- Finansal analiz ve bütçe planlaması\n- Yatırım tavsiyeleri\n- Borç yönetimi stratejileri\n- Finansal eğitim içerikleri\n\n**Örnek sorular:**\n- \"Aylık gelirimi ve giderlerimi analiz et\"\n- \"50.000 TL ile nasıl yatırım yapmalıyım?\"\n- \"Bütçe planı oluşturmama yardım et\"\n- \"Borç kartopu yöntemi nedir?\"",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID?.() ?? Math.random().toString(36).substring(2),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: input,
          userId: userId || "anonymous",
          context: {},
        }),
      })

      if (!response.ok) throw new Error("API error")

      const data = await response.json()

      if (data.messages) {
        setMessages((prev) => [...prev, ...data.messages])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID?.() ?? Math.random().toString(36).substring(2),
            role: "assistant",
            content: data.finalResponse || "Yanıt alınamadı.",
            timestamp: new Date(),
          },
        ])
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID?.() ?? Math.random().toString(36).substring(2),
          role: "assistant",
          content: "Üzgünüm, bir hata oluştu. Lütfen tekrar deneyin.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-[600px] flex flex-col bg-gray-900/40 backdrop-blur-md border border-cyan-500/20 shadow-lg shadow-cyan-500/5">
      <CardHeader className="border-b border-cyan-500/10 py-3">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
            <Bot className="h-5 w-5 text-white" />
          </div>
          AI Finansal Danışman
          <Sparkles className="h-4 w-4 text-emerald-400" />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <ScrollArea ref={scrollRef} className="h-full">
          <div className="space-y-4 p-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    {message.role === "user" ? (
                      <AvatarFallback className="bg-emerald-600">
                        <User className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    ) : (
                      <AvatarFallback
                        className={`bg-gradient-to-br ${message.agentType ? agentColors[message.agentType] : "from-emerald-500 to-teal-600"}`}
                      >
                        <Bot className="h-4 w-4 text-white" />
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 text-sm leading-relaxed ${
                      message.role === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-800/80 border border-cyan-500/10 text-gray-200"
                    }`}
                  >
                    {message.agentType && (
                      <div className="mb-1 text-xs font-medium text-emerald-400">
                        {agentLabels[message.agentType]}
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600">
                    <Bot className="h-4 w-4 text-white" />
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  className="rounded-lg px-4 py-3 bg-gray-900/60 backdrop-blur-md border border-cyan-400/30 shadow-lg shadow-cyan-500/10"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(6, 182, 212, 0.1)",
                      "0 0 40px rgba(6, 182, 212, 0.3)",
                      "0 0 20px rgba(6, 182, 212, 0.1)",
                    ],
                    borderColor: [
                      "rgba(6, 182, 212, 0.3)",
                      "rgba(6, 182, 212, 0.6)",
                      "rgba(6, 182, 212, 0.3)",
                    ],
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                    <span className="text-sm text-cyan-300">Analiz ediliyor...</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="border-t border-cyan-500/10 p-3">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Finansal sorunuzu yazın..."
            className="flex-1 bg-gray-800/50 border-cyan-500/20 focus:border-cyan-400/50 text-white placeholder-gray-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
