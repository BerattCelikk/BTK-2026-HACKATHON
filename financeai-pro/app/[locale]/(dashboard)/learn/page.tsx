"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { GraduationCap, BookOpen, Target, CheckCircle, ChevronRight } from "lucide-react"

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState("lessons")

  const lessons = [
    {
      title: "Bütçe Yapmanın Temelleri",
      topic: "Bütçe",
      difficulty: "Başlangıç",
      progress: 0,
      duration: "10 dk",
    },
    {
      title: "Tasarruf ve Acil Durum Fonu",
      topic: "Tasarruf",
      difficulty: "Başlangıç",
      progress: 0,
      duration: "8 dk",
    },
    {
      title: "Yatırım Araçlarına Giriş",
      topic: "Yatırım",
      difficulty: "Orta",
      progress: 0,
      duration: "15 dk",
    },
    {
      title: "Borç Yönetimi Stratejileri",
      topic: "Borç",
      difficulty: "Orta",
      progress: 0,
      duration: "12 dk",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Finansal Eğitim</h1>
        <p className="text-gray-400 mt-1">Finansal okuryazarlığınızı geliştirin</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lessons">Dersler</TabsTrigger>
          <TabsTrigger value="topics">Konular</TabsTrigger>
          <TabsTrigger value="progress">İlerleme</TabsTrigger>
        </TabsList>

        <TabsContent value="lessons" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lessons.map((lesson, i) => (
              <Card key={i} className="hover:border-gray-700 transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="outline" className="text-xs mb-2">
                        {lesson.topic}
                      </Badge>
                      <h3 className="text-lg font-semibold text-white">{lesson.title}</h3>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                      <BookOpen className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" className="text-xs">{lesson.difficulty}</Badge>
                      <span className="text-gray-500">{lesson.duration}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-400" />
                Konular
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {["Bütçe", "Tasarruf", "Yatırım", "Borç", "Kredi", "Vergi", "Emeklilik", "Sigorta"].map(
                  (topic) => (
                    <div
                      key={topic}
                      className="rounded-lg bg-gray-800/50 p-4 text-center hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      <p className="text-sm font-medium text-gray-300">{topic}</p>
                      <p className="text-xs text-gray-600 mt-1">0 ders</p>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>İlerleme</CardTitle>
              <CardDescription>Öğrenme yolculuğunuzdaki ilerlemeniz</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <GraduationCap className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Henüz ders tamamlanmamış</p>
                <p className="text-sm text-gray-600 mt-1">Bir ders seçerek öğrenmeye başlayın</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
