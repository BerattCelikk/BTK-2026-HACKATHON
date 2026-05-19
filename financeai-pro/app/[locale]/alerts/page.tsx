import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prisma from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, TrendingUp, Calendar, Clock } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

async function getAnomalies(userId: string) {
  return await prisma.anomaly.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20
  })
}

export default async function AlertsPage() {
  const { userId: clerkId } = await auth()
  if (!clerkId) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { clerkId }
  })

  if (!user) redirect("/login")

  const anomalies = await getAnomalies(user.id)

  const getSeverityConfig = (severity: number) => {
    if (severity >= 8) return { 
      color: "text-red-500", 
      border: "border-red-500/30", 
      bg: "bg-red-500/10",
      icon: AlertTriangle
    }
    if (severity >= 5) return { 
      color: "text-yellow-500", 
      border: "border-yellow-500/30", 
      bg: "bg-yellow-500/10",
      icon: AlertCircle
    }
    return { 
      color: "text-blue-500", 
      border: "border-blue-500/30", 
      bg: "bg-blue-500/10",
      icon: TrendingUp
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-cyan-500" />
        <h1 className="text-3xl font-bold text-white tracking-tight">Uyarılar & Anomaliler</h1>
      </div>

      <div className="grid gap-4">
        {anomalies.length === 0 ? (
          <Card className="bg-gray-900/40 backdrop-blur-md border border-cyan-500/20">
            <CardContent className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/10 mb-4">
                <AlertCircle className="h-8 w-8 text-cyan-500" />
              </div>
              <p className="text-gray-400 text-lg">Henüz herhangi bir anomali tespit edilmedi.</p>
              <p className="text-sm text-gray-500 mt-2">Sistemimiz harcamalarınızı ve bütçenizi sürekli analiz ediyor.</p>
            </CardContent>
          </Card>
        ) : (
          anomalies.map((anomaly) => {
            const config = getSeverityConfig(anomaly.severity)
            const Icon = config.icon

            return (
              <Card 
                key={anomaly.id} 
                className={`bg-gray-900/40 backdrop-blur-md border ${config.border} overflow-hidden transition-all hover:shadow-lg hover:shadow-cyan-500/5`}
              >
                <div className={`h-1 w-full ${config.bg.replace('/10', '/40')}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <Icon size={20} className={config.color} />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-white font-semibold">
                          {anomaly.type === 'spending_spike' ? 'Harcama Sıçraması' : 
                           anomaly.type === 'category_anomaly' ? 'Kategori Anomalisi' : 
                           'Bütçe Aşımı'}
                        </CardTitle>
                        <div className="flex items-center gap-3 mt-1">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            {format(new Date(anomaly.createdAt), "d MMMM yyyy", { locale: tr })}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={12} />
                            {format(new Date(anomaly.createdAt), "HH:mm", { locale: tr })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${config.bg} ${config.color} border ${config.border}`}>
                      Skor: {anomaly.severity}/10
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed italic border-l-2 border-cyan-500/30 pl-4 py-1">
                    "{anomaly.message}"
                  </p>
                  
                  {anomaly.reviewed && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500 font-medium">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      İncelendi
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
