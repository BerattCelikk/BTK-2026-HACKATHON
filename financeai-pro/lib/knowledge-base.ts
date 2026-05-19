export interface KnowledgeArticle {
  title: string;
  content: string;
  category: "Budget" | "Debt" | "Investment" | "Savings" | "Retirement";
}

export const KNOWLEDGE_BASE_ARTICLES: KnowledgeArticle[] = [
  {
    title: "50/30/20 Kuralı ile Bütçe Yönetimi",
    category: "Budget",
    content: "Bütçe yapmanın en basit yollarından biri 50/30/20 kuralıdır. Bu kurala göre aylık net gelirinizin %50'sini temel ihtiyaçlarınıza (kira, faturalar, gıda), %30'unu isteklerinize (eğlence, dışarıda yemek, hobiler) ve %20'sini finansal hedeflerinize (borç ödeme, tasarruf, yatırım) ayırmalısınız. Bu yöntem, finansal dengenizi korumanıza ve geleceğiniz için birikim yapmanıza yardımcı olur.",
  },
  {
    title: "Borç Ödeme Stratejileri: Kartopu ve Çığ Yöntemleri",
    category: "Debt",
    content: "Borçlarınızdan kurtulmak için iki popüler yöntem vardır: Kartopu ve Çığ yöntemleri. Kartopu yöntemi, en küçük borçtan başlayarak borçları kapatmayı ve her borç kapandığında artan motivasyonla bir sonrakine geçmeyi hedefler. Çığ yöntemi ise, en yüksek faiz oranına sahip borçtan başlayarak toplam ödenen faizi minimize etmeyi amaçlar. Psikolojik rahatlık için Kartopu, matematiksel verimlilik için Çığ yöntemi tercih edilebilir.",
  },
  {
    title: "Bileşik Getirinin Gücü",
    category: "Investment",
    content: "Bileşik getiri, 'dünyanın sekizinci harikası' olarak adlandırılır. Yatırımlarınızdan elde ettiğiniz kazançların tekrar yatırıma dönüşmesi ve bu kazançların da kazanç getirmesi sürecidir. Ne kadar erken yatırım yapmaya başlarsanız, bileşik getirinin etkisi o kadar büyük olur. Örneğin, 20 yaşında aylık küçük bir miktar biriktirmeye başlayan bir kişi, 40 yaşında başlamış birine göre emeklilikte çok daha büyük bir servete sahip olabilir.",
  },
  {
    title: "Acil Durum Fonu Neden Önemlidir?",
    category: "Savings",
    content: "Acil durum fonu, beklenmedik olaylar (iş kaybı, sağlık sorunları, araç arızası) karşısında finansal güvenliğinizi sağlayan bir birikimdir. İdeal olarak, aylık giderlerinizin 3 ila 6 katı kadar bir miktarı kolayca ulaşılabilir bir hesapta tutmalısınız. Bu fon, kriz anlarında borçlanmanızı önler ve stresinizi azaltır.",
  },
  {
    title: "Türkiye'de Bireysel Emeklilik Sistemi (BES)",
    category: "Retirement",
    content: "Bireysel Emeklilik Sistemi (BES), emeklilik döneminizde ek bir gelir sağlamak amacıyla oluşturulmuş bir tasarruf sistemidir. Türkiye'de devlet, yatırdığınız katkı paylarının %30'u kadar bir devlet katkısı sağlayarak birikimlerinizi teşvik eder. Uzun vadeli bir yatırım olan BES, vergi avantajları ve profesyonel fon yönetimi ile emeklilik planlarınız için güçlü bir araçtır.",
  },
  {
    title: "Hisse Senedi Yatırımı ve Risk Yönetimi",
    category: "Investment",
    content: "Hisse senetleri uzun vadede yüksek getiri potansiyeli sunar ancak beraberinde riskler de getirir. Risk yönetimi için portföy çeşitlendirmesi yapmak kritiktir. Tüm paranızı tek bir hisseye yatırmak yerine, farklı sektörlerden ve varlık sınıflarından (hisse, altın, döviz, fon) oluşan bir sepet oluşturmalısınız. Ayrıca, piyasa dalgalanmalarına karşı duygusal kararlar vermekten kaçınmak ve uzun vadeli hedeflere odaklanmak başarı için gereklidir.",
  },
  {
    title: "Enflasyondan Korunma Yolları",
    category: "Savings",
    content: "Enflasyon, paranın alım gücünün zamanla azalmasıdır. Birikimlerinizi sadece nakit olarak tutmak, enflasyon karşısında değer kaybetmesine neden olur. Enflasyondan korunmak için birikimlerinizi altın, döviz korumalı mevduat, gayrimenkul veya hisse senedi fonları gibi enflasyon üzerinde getiri sağlama potansiyeli olan varlıklarda değerlendirmeyi düşünebilirsiniz.",
  },
];
