export class EducationAgent {
  private lessons = [
    {
      id: "budget-101",
      title: "Bütçe Yapmanın Temelleri",
      topic: "Bütçe",
      content: `Bütçe yapmak, finansal başarının ilk adımıdır. 
      
50/30/20 Kuralı:
• %50 - Zorunlu Harcamalar (kira, fatura, market)
• %30 - Kişisel Harcamalar (eğlence, alışveriş)
• %20 - Tasarruf ve Yatırım

Bütçe yaparken:
1. Tüm gelirlerinizi yazın
2. Tüm giderlerinizi kategorize edin
3. Tasarruf hedefi belirleyin
4. Düzenli olarak gözden geçirin`,
      difficulty: "beginner",
      duration: "10 dk",
      quiz: [
        {
          question: "50/30/20 kuralında tasarrufa ayrılması önerilen oran nedir?",
          options: ["%10", "%20", "%30", "%50"],
          correctAnswer: 1,
          explanation: "50/30/20 kuralında gelirin %20'si tasarruf ve yatırıma ayrılmalıdır.",
        },
        {
          question: "Hangi harcama türü %50'lik zorunlu harcamalar kısmına girer?",
          options: ["Sinema bileti", "Kira", "Alışveriş", "Tatil"],
          correctAnswer: 1,
          explanation: "Kira, zorunlu bir harcamadır ve %50'lik dilime girer.",
        },
      ],
    },
    {
      id: "saving-101",
      title: "Tasarruf ve Acil Durum Fonu",
      topic: "Tasarruf",
      content: `Acil durum fonu, beklenmedik durumlar için hayati öneme sahiptir.

Neden Önemli?
• İş kaybı
• Sağlık sorunları
• Acil tamiratlar

Ne Kadar?
• Bekar: 3 aylık gider
• Aileli: 6 aylık gider

Nerede Tutulmalı?
• Vadeli hesap
• Para piyasası fonu
• Kolay erişilebilir`,
      difficulty: "beginner",
      duration: "8 dk",
      quiz: [
        {
          question: "Acil durum fonunda en az kaç aylık gider bulunmalıdır?",
          options: ["1 ay", "3 ay", "6 ay", "12 ay"],
          correctAnswer: 1,
          explanation: "En az 3 aylık gider kadar acil durum fonu önerilir.",
        },
      ],
    },
    {
      id: "invest-101",
      title: "Yatırım Araçlarına Giriş",
      topic: "Yatırım",
      content: `Temel yatırım araçları:

1. Hisse Senedi: Şirket ortaklığı, yüksek getiri potansiyeli, yüksek risk
2. Tahvil: Devlet/şirket borçlanması, düşük risk, sabit getiri
3. Altın: Değer saklama, enflasyona karşı koruma
4. Döviz: Kur riski, spekülatif
5. Yatırım Fonu: Profesyonel yönetim, çeşitlendirme
6. Kripto Para: Çok yüksek risk, yüksek volatilite`,
      difficulty: "intermediate",
      duration: "15 dk",
      quiz: [
        {
          question: "Hangi yatırım aracı en düşük risk profiline sahiptir?",
          options: ["Kripto para", "Hisse senedi", "Devlet tahvili", "Girişim sermayesi"],
          correctAnswer: 2,
          explanation: "Devlet tahvilleri, devlet garantisi nedeniyle en düşük riskli yatırım araçlarındandır.",
        },
      ],
    },
    {
      id: "debt-101",
      title: "Borç Yönetimi Stratejileri",
      topic: "Borç",
      content: `Borçlarınızı yönetmek için iki temel strateji:

Kartopu Yöntemi:
• En küçük borçtan başlayın
• Her borcu kapattıkça motivasyon artar
• Psikolojik olarak daha kolay

Çığ Yöntemi:
• En yüksek faizli borçtan başlayın
• Matematiksel olarak daha avantajlı
• Daha az faiz ödersiniz`,
      difficulty: "intermediate",
      duration: "12 dk",
      quiz: [
        {
          question: "Çığ yönteminde öncelik hangi borca verilir?",
          options: ["En küçük borç", "En yüksek faizli borç", "En eski borç", "En yeni borç"],
          correctAnswer: 1,
          explanation: "Çığ yönteminde en yüksek faizli borca öncelik verilir.",
        },
      ],
    },
  ]

  getLessons() {
    return this.lessons
  }

  getLessonById(id: string) {
    return this.lessons.find((l) => l.id === id)
  }

  getLessonsByDifficulty(difficulty: string) {
    return this.lessons.filter((l) => l.difficulty === difficulty)
  }

  getTopics() {
    return [...new Set(this.lessons.map((l) => l.topic))]
  }

  checkQuizAnswer(lessonId: string, questionIndex: number, selectedAnswer: number) {
    const lesson = this.getLessonById(lessonId)
    if (!lesson) return { correct: false, explanation: "Ders bulunamadı" }

    const question = lesson.quiz[questionIndex]
    if (!question) return { correct: false, explanation: "Soru bulunamadı" }

    const correct = selectedAnswer === question.correctAnswer
    return {
      correct,
      explanation: question.explanation,
      correctAnswer: question.options[question.correctAnswer],
    }
  }

  async generateLessonSummary(topic: string): Promise<string> {
    const topicLessons = this.lessons.filter(
      (l) => l.topic.toLowerCase() === topic.toLowerCase()
    )

    if (topicLessons.length === 0) {
      return `**${topic}** konusunda henüz bir ders bulunmuyor.`
    }

    let summary = `**${topic} - Eğitim Özeti**\n\n`
    for (const lesson of topicLessons) {
      summary += `**${lesson.title}** (${lesson.difficulty} - ${lesson.duration})\n`
      summary += `${lesson.content.substring(0, 100)}...\n\n`
    }
    summary += `\nBu konuda ${topicLessons.length} ders bulunuyor.`
    return summary
  }
}
