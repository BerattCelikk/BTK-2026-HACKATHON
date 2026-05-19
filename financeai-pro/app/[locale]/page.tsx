import Link from "next/link"
import { Bot, ArrowRight, Sparkles, Shield, TrendingUp, GraduationCap, Wallet, BarChart3, ScanLine, Brain, Zap } from "lucide-react"

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
            <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Giriş Yap</Link>
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 transition-all">
              Ücretsiz Başla <ArrowRight className="h-4 w-4" />
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
            Kişisel Finansal<br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Danışmanınız Var</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            5 uzman AI ajanı, finansal durumunuzu analiz ediyor, strateji öneriyor,
            gelecek planlamanızda yardımcı oluyor. 7/24, ücretsiz, tamamen Türkçe.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 transition-all">
              Hemen Başla <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto mt-16">
            <div><div className="text-3xl font-bold text-emerald-400">5</div><div className="text-sm text-gray-500">Uzman Ajan</div></div>
            <div><div className="text-3xl font-bold text-emerald-400">∞</div><div className="text-sm text-gray-500">7/24 Erişim</div></div>
            <div><div className="text-3xl font-bold text-emerald-400">100%</div><div className="text-sm text-gray-500">Türkçe</div></div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Neler Yapabilirsiniz?</h2>
          <p className="text-gray-400 text-center mb-16 max-w-xl mx-auto">Finansal yaşamınızın her yönü için AI desteği</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: "Finansal Analiz", desc: "AI danışmanın, gelir/gider dağılımını analiz ediyor, tasarruf potansiyelini hesaplıyor.", color: "from-blue-500 to-cyan-500" },
              { icon: Shield, title: "Anomali Tespiti", desc: "Anormal harcamaları otomatik tespit et, uyarı al, tasarruf et.", color: "from-amber-500 to-red-500" },
              { icon: TrendingUp, title: "Yatırım Simülasyonu", desc: "Risk profiline göre portföy dağılımı, getiri projeksiyonu, strateji karşılaştırması.", color: "from-purple-500 to-pink-500" },
              { icon: ScanLine, title: "Akıllı Fiş Okuma", desc: "Fişi fotoğrafla, Gemini Vision otomatik tutar/kategori çıkarıyor.", color: "from-cyan-500 to-blue-500" },
              { icon: Wallet, title: "Borç Yönetimi", desc: "Snowball/Avalanche stratejisi karşılaştırması, ödeme planlaması.", color: "from-emerald-500 to-teal-500" },
              { icon: Brain, title: "Akıllı Danışman", desc: "5 uzman AI ajanını çağır, doğal dilde sorularına cevap al.", color: "from-violet-500 to-indigo-500" },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 group">
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-white text-center mb-16">Nasıl Çalışır?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { num: "1", title: "Kaydol", desc: "E-posta ve şifreyle hızlıca kayıt olun" },
              { num: "2", title: "Verileri Gir", desc: "Gelir, gider ve hedeflerinizi ekleyin" },
              { num: "3", title: "AI Analiz", desc: "5 uzman ajan verilerinizi analiz ediyor" },
              { num: "4", title: "Tavsiye Al", desc: "Kişiye özel strateji ve öneriler alın" },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white shadow-lg shadow-emerald-500/25">
                  {step.num}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Finansal Özgürlüğe Adım At</h2>
          <p className="text-lg text-gray-400 max-w-xl mx-auto mb-10">
            Binlerce Türk kullanıcı FinanceAI Pro ile finansal hedeflerine ulaşıyor.
            Siz de başlayabilirsiniz, hemen, ücretsiz.
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-3 text-base font-medium text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-700 transition-all">
            <Zap className="h-5 w-5" /> Ücretsiz Başla
          </Link>
        </section>

        <footer className="border-t border-gray-800">
          <div className="container mx-auto px-6 py-8 text-center">
            <p className="text-gray-500 text-sm">© 2026 FinanceAI Pro — Finansal Danışmanlık Platformu</p>
            <p className="text-gray-600 text-xs mt-1">BTK Academy Hackathon 2026</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
