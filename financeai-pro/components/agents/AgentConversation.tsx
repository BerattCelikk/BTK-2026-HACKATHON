"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, User, Bot, Loader2, Sparkles, Brain, ArrowRightLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { AgentCapabilities } from "./AgentCapabilities"

interface Message {
  role: "user" | "assistant" | "agent"
  content: string
  agentId?: string
  confidence?: number
}

export function AgentConversation({ initialAgent = "auto" }: { initialAgent?: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [currentAgent, setCurrentAgent] = useState(initialAgent)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch(`/api/agents/v2/${currentAgent}`, {
        method: "POST",
        body: JSON.stringify({ query: input }),
        headers: { "Content-Type": "application/json" }
      })

      const data = await response.json()
      
      if (data.agentId && data.agentId !== currentAgent && currentAgent !== "auto") {
        setMessages(prev => [...prev, { 
          role: "assistant", 
          content: `İsteğiniz doğrultusunda ${data.agentId} uzmanına geçiş yapıldı.`,
          agentId: "system"
        }])
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.response,
        agentId: data.agentId,
        confidence: data.confidence
      }])
      
      if (data.agentId) setCurrentAgent(data.agentId)

    } catch (error) {
      console.error("Chat error:", error)
      setMessages(prev => [...prev, { role: "assistant", content: "Bir hata oluştu, lütfen tekrar deneyin." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
      <div className="lg:col-span-3 flex flex-col bg-background/40 backdrop-blur-md border border-primary/20 rounded-xl overflow-hidden shadow-xl">
        {/* Header */}
        <div className="p-4 border-b border-primary/10 flex items-center justify-between bg-primary/5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg">
              <Brain size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Akıllı Finansal Asistan</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                Mod: {currentAgent === "auto" ? "Otomatik Yönlendirme" : currentAgent}
              </p>
            </div>
          </div>
          {isLoading && (
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary animate-pulse">
              <Loader2 size={12} className="animate-spin" />
              AJAN DÜŞÜNÜYOR...
            </div>
          )}
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full opacity-20 py-20 text-center">
                <Sparkles size={48} className="mb-4 text-primary" />
                <p className="text-sm font-medium">Finansal hedefleriniz, bütçeniz veya piyasalar hakkında soru sorarak başlayın.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  m.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                  m.role === "user" ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {m.role === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={cn(
                  "p-3 rounded-2xl text-sm leading-relaxed shadow-sm",
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-muted/50 border border-primary/5 rounded-tl-none"
                )}>
                  {m.content}
                  {m.confidence && (
                    <div className="mt-2 pt-2 border-t border-primary/10 flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase text-muted-foreground">Güven: %{Math.round(m.confidence * 100)}</span>
                      {m.agentId && <span className="text-[9px] italic text-primary">Ajan: {m.agentId}</span>}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-muted/30 p-4 rounded-2xl rounded-tl-none">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                        className="h-1.5 w-1.5 rounded-full bg-primary"
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 bg-background/80 border-t border-primary/10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend() }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="bg-muted/50 border-primary/10 focus-visible:ring-primary h-11 rounded-xl"
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={isLoading || !input.trim()}
              className="h-11 w-11 rounded-xl shadow-lg shadow-primary/20"
            >
              <Send size={18} />
            </Button>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col gap-6">
        <AgentCapabilities agentId={currentAgent} />
        
        <Card className="bg-background/40 backdrop-blur-md border border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ArrowRightLeft size={12} /> Hızlı Ajan Seçimi
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-2">
            {["auto", "financial_analyst", "budget_optimizer", "investment_advisor", "debt_manager"].map(a => (
              <Button
                key={a}
                variant={currentAgent === a ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setCurrentAgent(a)}
                className={cn(
                  "justify-start text-[10px] h-8 font-bold uppercase transition-all",
                  currentAgent === a ? "bg-primary/20 text-primary" : "hover:bg-primary/10"
                )}
              >
                {a === "auto" ? "Otomatik" : a.replace("_", " ")}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
