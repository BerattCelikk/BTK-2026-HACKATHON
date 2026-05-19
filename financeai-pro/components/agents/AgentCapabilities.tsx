"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot, Zap, Brain, Shield, Info } from "lucide-react"

interface AgentCapability {
  id: string
  name: string
  specialization: string
  tools: string[]
  relatedAgents: string[]
  confidence: "low" | "medium" | "high"
}

const CAPABILITIES: AgentCapability[] = [
  {
    id: "financial_analyst",
    name: "Finansal Analist",
    specialization: "Derinlemesine mali durum analizi ve raporlama.",
    tools: ["İşlem Geçmişi Sorgulama", "Trend Analizi", "Anomali Tespiti"],
    relatedAgents: ["Budget Optimizer", "Investment Advisor"],
    confidence: "high"
  },
  {
    id: "budget_optimizer",
    name: "Bütçe Uzmanı",
    specialization: "Gider kalemlerini optimize etme ve tasarruf stratejileri.",
    tools: ["Bütçe Planlama", "Tasarruf Tahmini", "Limit Kontrolü"],
    relatedAgents: ["Financial Analyst", "Debt Manager"],
    confidence: "high"
  },
  {
    id: "investment_advisor",
    name: "Yatırım Danışmanı",
    specialization: "Portföy yönetimi ve piyasa beklentileri.",
    tools: ["Portföy Simülasyonu", "Varlık Dağılımı", "Risk Analizi"],
    relatedAgents: ["Financial Analyst"],
    confidence: "medium"
  }
]

export function AgentCapabilities({ agentId }: { agentId: string }) {
  const agent = CAPABILITIES.find(c => c.id === agentId) || CAPABILITIES[0]

  return (
    <Card className="bg-background/40 backdrop-blur-md border border-primary/20 overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Bot size={16} className="text-primary" />
          Ajan Yetenekleri: {agent.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {agent.specialization}
        </p>

        <div className="space-y-2">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <Zap size={10} /> Uzmanlık Araçları
          </h4>
          <div className="flex flex-wrap gap-1">
            {agent.tools.map(tool => (
              <Badge key={tool} variant="secondary" className="text-[9px] bg-primary/10 text-primary border-none">
                {tool}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-primary/10">
          <div className="flex flex-col">
            <span className="text-[9px] text-muted-foreground uppercase font-bold">Güven Seviyesi</span>
            <div className="flex gap-0.5 mt-0.5">
              {[1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className={`h-1 w-4 rounded-full ${
                    i <= (agent.confidence === "high" ? 3 : agent.confidence === "medium" ? 2 : 1)
                    ? "bg-emerald-500" : "bg-muted"
                  }`} 
                />
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-end">
             <span className="text-[9px] text-muted-foreground uppercase font-bold">İlgili Ajanlar</span>
             <span className="text-[10px] font-medium">{agent.relatedAgents.join(", ")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
