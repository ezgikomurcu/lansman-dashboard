# Launchly — Lansman Kontrol Merkezi

Turkcell C6 ekibi için, talep/analiz/lansman süreçlerini yönetici gözünden takip eden staj projesi dashboard'u.

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Frontend | React + Vite, Chart.js, jsPDF |
| Backend | Node.js + Express |
| Veritabanı | PostgreSQL |
| Kimlik doğrulama | bcrypt (şifre hash'leme) + JWT (oturum token'ı) |

## Kurulum

### 1. Veritabanı
- PostgreSQL kurulu ve çalışıyor olmalı.
- `lansman_db` adında boş bir veritabanı oluştur (pgAdmin ile).

### 2. Backend
```bash
cd backend
npm install
```

`backend/.env` dosyası oluştur (bu dosya `.gitignore`'da, GitHub'a gitmez):
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<kendi_postgres_sifren>
DB_NAME=lansman_db
JWT_SECRET=<uzun_rastgele_bir_metin>
```

```bash
npm run dev      # backend'i başlatır, port 3000
```

İlk kurulumda, **ayrı bir terminalde**:
```bash
npm run seed      # Excel verisini veritabanına aktarır (468 kayıt + 7 takım)
```

### 3. Frontend
Proje ana dizininde:
```bash
npm install
npm run dev       # port 5173
```

### 4. Font (PDF için)
[Google Fonts](https://fonts.google.com/specimen/Roboto)'tan Roboto indirip `Roboto-Regular.ttf` ve `Roboto-Bold.ttf` dosyalarını `public/fonts/` klasörüne koy (Türkçe karakterli PDF raporu için gerekli).

## Özellikler

- **Giriş/Kayıt/Şifremi Unuttum** — e-posta ile, gerçek bcrypt + JWT + token tabanlı şifre sıfırlama
- **6 sayfa**: Genel Bakış, Lansmanlar, Bekleyen Talepler, Kişi Performansı, Takım Dağılımı, Raporlar
- **Filtreleme**: hızlı aralık (90 gün/12 ay/tüm zamanlar) + özel tarih aralığı
- **12 farklı grafik**, gerçek Excel verisine dayalı (lansman trendi, süreç adımı dağılımı, alt tip dağılımı, takım/kişi karşılaştırmaları vb.)
- **CSV ve PDF export** (PDF: Türkçe karakter destekli, markalı tasarım, otomatik yazılı özet)
- **Chatbot** — kural tabanlı, bulanık eşleştirmeli Türkçe soru-cevap asistanı
- **3 tema** (koyu/açık/pembe)

## Bilinen Sınırlamalar

- Otomatik test yok
- CORS şu an sınırsız açık (canlıya almadan önce daraltılmalı)
- Login'de deneme sınırı (rate limit) yok
- Henüz canlıya alınmadı, sadece local'de çalışıyor