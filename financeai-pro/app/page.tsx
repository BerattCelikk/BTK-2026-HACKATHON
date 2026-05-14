import Link from "next/link"
import { Bot, ArrowRight, Sparkles, Shield, TrendingUp, GraduationCap, Wallet } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-950 to-emerald-950">
      <header className="border-b border-gray-800">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">FinanceAI <span className="text-emerald-400">Pro</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 transition-all"
            >
              Başla
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm text-emerald-400 mb-8">
            <Sparkles className="h-4 w-4" />
            Yapay Zeka Destekli Finansal Danışman
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Akıllı Finansal
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Geleceğiniz
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            5 uzman AI ajanı ile kişiselleştirilmiş finansal planlama, yatırım analizi,
            bütçe optimizasyonu ve finansal eğitim.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 transition-all"
            >
              Ücretsiz Başla
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        <section className="container mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-white text-center mb-16">
            5 Uzman AI Ajanı
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Wallet,
                title: "Finansal Analist",
                desc: "Gelir-gider analizi, nakit akışı takibi, tasarruf potansiyeli hesaplama",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: TrendingUp,
                title: "Yatırım Danışmanı",
                desc: "Risk profili analizi, portföy simülasyonu, varlık dağılımı optimizasyonu",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Shield,
                title: "Bütçe Uzmanı",
                desc: "Akıllı bütçe oluşturma, harcama analizi, tasarruf fırsatları",
                color: "from-emerald-500 to-teal-500",
              },
              {
                icon: GraduationCap,
                title: "Eğitim Asistanı",
                desc: "Etkileşimli dersler, quizler, finansal okuryazarlık eğitimi",
                color: "from-yellow-500 to-orange-500",
              },
              {
                icon: Shield,
                title: "Borç Yöneticisi",
                desc: "Kartopu/çığ yöntemi, ödeme planı optimizasyonu, faiz hesaplama",
                color: "from-red-500 to-rose-500",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-gray-700 transition-all"
              >
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-800">
          <div className="container mx-auto px-6 py-16 text-center">
            <p className="text-gray-500 text-sm">
              BTK Academy 2026 Hackathon - Powered by Google Gemini AI
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
