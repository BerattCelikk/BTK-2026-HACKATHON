# 🎬 FinanceAI Pro — 5-Minute Demo Script

## Setup (Before Judges Arrive)
- [ ] `docker compose up -d` — app and database running
- [ ] Run seed data: `npx tsx prisma/seed/index.ts`
- [ ] Log into Clerk dashboard, verify `demo@financeai.com` exists
- [ ] Open browser at `http://localhost:3000`
- [ ] Log in as demo user — stay on Dashboard
- [ ] Have 3 receipt images ready on desktop
- [ ] Close all other tabs
- [ ] Verify all pages load without errors

---

## Demo Flow (Timed)

### 0:00 — Opening Hook (30 sec)

> "Herkes bir mali danışmana para ödeyemez. FinanceAI Pro ile 5 uzman AI ajanı, 7/24 finansal danışmanlık sunuyor. Hadi görelim."

### 0:30 — Dashboard — The "Wow" Moment (90 sec)

> *(Already on dashboard)*

> "Bu ana ekran. AI sabah sizi karşılıyor — kişiselleştirilmiş günlük brifing."

**ACTION:** Point to the Daily Briefing box (emerald gradient banner at top)

> "Bugünkü sağlık skorunuz: 84/100. Animasyonlu gösterge canlanıyor."

**ACTION:** Watch the Health Score gauge animate to 84

> "Üç rozet kazandınız: Tasarruf Ustası, Borç Yokedici, Bütçe Kahramanı — hepsi yeşil parlıyor."

**ACTION:** Mouse over each badge in the Rozetler section

> "AI anormallik tespit etti — bir kategoride yüksek harcama. Kırmızı kutuda uyarı."

**ACTION:** Point to the amber/red anomaly alert card

### 2:00 — Budget + Receipt Scanner (90 sec)

**ACTION:** Navigate to `/budget` → "Gelir/Gider Ekle" tab

> "Gelir veya gider ekleyebilirsiniz. Ama daha iyisi — fiş okutma özelliği."

**ACTION:** Drag a receipt image onto the upload zone → Click "Analiz Et"

> "Gemini Vision, bu fişteki veriyi çıkarıyor: tutar, kategori, açıklama. Saniyeler içinde kaydedildi."

**ACTION:** Point to the success result card with extracted data

> "Tüm işlemler CSV olarak dışa aktarılabilir — muhasebe için."

**ACTION:** Click "CSV İndir" → show the downloaded file

### 3:30 — Debt Strategy Visualizer (45 sec)

**ACTION:** Navigate to `/debt`

> "Borç yönetimi sayfası. Üç borcunuz var. İki stratejiyi karşılaştıralım."

**ACTION:** Toggle between Snowball and Avalanche in the dropdown

> "Kartopu: önce küçük borçlar. Çığ: önce yüksek faizli borçlar. Grafik anında değişiyor. Hangisi daha avantajlı? AI bunu söylüyor."

**ACTION:** Point to the side-by-side comparison box showing savings difference

### 4:15 — Market Ticker + Invest Simulator (45 sec)

**ACTION:** Navigate to `/invest`

> "Bloomberg terminali gibi — canlı piyasa takip şeridi."

**ACTION:** Let the ticker scroll for a moment

> "USD/TRY, EUR/TRY, Bitcoin, BIST 100 — hepsi saniyede bir güncelleniyor."

**ACTION:** Click "Simülasyonu Çalıştır" with default values

> "AI portföy dağılımı öneriyor: hisse senedi, tahvil, nakit, kripto. Beklenen getiri ve risk seviyesiyle birlikte."

### 5:00 — Multi-Agent AI Chat + Closing (60 sec)

**ACTION:** Navigate to `/dashboard` → scroll to AgentChat

> "En güçlü özellik: 5 AI ajanı tek sohbette."

**ACTION:** Type "Bütçemi analiz et ve öneri ver" → Send

> "Orkestratör ajan, isteği analiz ediyor... Finansal Analist ajanına yönlendiriyor... Tool calling ile veritabanından veri çekiyor... Sonuç."

**ACTION:** Show the AI response with analysis

> "FinanceAI Pro — yapay zeka destekli, çoklu ajanlı, kurumsal hazır finansal danışmanınız. **Teşekkür ederim.**"

---

## If Something Breaks

| Issue | Recovery |
|-------|----------|
| Gemini slow | "AI şu anda yoğun, bir saniye..." — wait, it will return |
| Empty data | "Demo verisiyle hazırladık, bir saniyede yükleniyor." |
| Page crash | Show error boundary — "Güzel hata yönetimimiz var, yenileyelim." |
| Auth issue | "Clerk ile güvenli kimlik doğrulama — yeniden giriş yapalım." |
| Receipt fails | "Bazen okunmuyor, başka bir fiş deneyelim." — use second image |
