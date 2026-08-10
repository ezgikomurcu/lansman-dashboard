# C6 Lansman Kontrol Merkezi

Turkcell C6 ekibinin talep, analiz ve lansman süreçlerini takip etmesi için
geliştirilen bir yönetici dashboard'u. Staj projesi kapsamında geliştirilmiştir.

## Özellikler

- 🔐 Rol bazlı giriş ekranı (Yönetici / Analist / QA)
- 📊 Kişi bazlı ve genel lansman istatistikleri
- 📈 Yıllık ay bazlı lansman, açılan talep ve açık/kapalı oranı grafikleri
- ✅ Onay kuyruğu (Onayla/Reddet) ve SLA gecikme uyarıları
- 🕒 Talep detay/zaman çizelgesi (Açıldı → Analiz → 2. Göz → QA → Lansman)
- 👤 Kişi bazlı performans profili
- 🏢 Takım bazlı talep dağılımı
- 📅 Dönem karşılaştırması ve CSV dışa aktarım
- 🔎 Arama, 🔔 bildirimler, 🌙/☀️ tema değiştirme
- 📆 Zaman aralığı filtresi (Son 90 gün / Son 12 ay / Tüm zamanlar)

## Kullanılan teknolojiler

- React (Vite ile)
- Chart.js / react-chartjs-2
- Vanilla CSS (custom design system)

## Geliştirme ortamını çalıştırma

```bash
npm install
npm run dev
```

Tarayıcıda `http://localhost:5173` adresini aç.

## Not

Bu projedeki tüm veriler (kişi isimleri, talep açıklamaları, tarihler)
**dummy** (sahte) verilerdir, gerçek Turkcell verisi içermez.