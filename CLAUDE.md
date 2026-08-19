# Launchly — Proje Bağlamı

Bu dosya, projeye yeni başlayan bir Claude oturumunun (ya da geliştiricinin) hızlıca bağlam kazanması için yazıldı.

## Ne bu proje

Turkcell C6 ekibi için staj projesi — talep/analiz/lansman süreçlerini gösteren bir yönetici dashboard'u. Gerçek Excel verisiyle (468 kayıt) çalışıyor, kişi isimleri hariç (onlar üretilmiş/dummy).

## Mimari

React (Vite, :5173) ←fetch→ Express (Node, :3000) ←pg→ PostgreSQL (lansman_db)

- Frontend tamamen `DATA`/`TEAMS`/`PEOPLE` gibi modül-seviyesi `let` değişkenlerinden besleniyor (`src/data/dummyData.js`). `loadDataFromAPI()` çağrılınca bu değişkenler backend'den taze veriyle dolduruluyor — bileşenler bunları import edip **otomatik güncel** kalıyor.
- Backend `routes/` altında konusuna göre bölünmüş: `requests.js`, `auth.js`, `teams.js`. `server.js` sadece bunları `/api/...` altına bağlıyor (`authRouter` doğrudan `/api` altına, diğerleri kendi alt path'lerine).
- JWT sadece **durum değiştiren** uç noktalarda zorunlu (`/approve`, `/reject`) — salt okuma uç noktaları (`GET /api/requests` vb.) korumasız, çünkü veri login ekranından önce yükleniyor (bilinçli tasarım kararı).
- Auth uçları: `POST /api/signup`, `/api/login`, `/api/forgot-password`, `/api/reset-password`. Şifreler bcrypt ile hash'leniyor, JWT 24 saat geçerli.
- **Şifre sıfırlama e-posta göndermiyor** — henüz mail servisi entegre değil. `forgot-password` uç noktası `resetToken`'ı doğrudan JSON yanıtında döndürüyor, frontend (`Login.jsx`) bunu ekranda "Bu linke tıkla (demo)" butonuyla gösterip `reset` moduna geçiyor. Bilinçli bir geçici demo akışı — gerçek mail gönderimi henüz yok.
- Backend `GET /api/requests` tüm 468 kaydı tek seferde döndürüyor; sayfalama/sıralama/filtreleme tamamen **frontend'de** yapılıyor (`Pagination.jsx` ve bileşen içi state).

## Önemli kurallar / kararlar

- **Sahte veri üretmeyiz.** Excel'de olmayan bir alanı (örn. geçmişe dönük "kim ne zaman onayladı" kaydı) asla uydurmadık — `activity_log` bilerek eklenmedi, "bundan sonraki gerçek işlemler kaydedilsin" ilkesi benimsendi ama henüz uygulanmadı.
- **`RANGE_END`**, gerçek `new Date()` — veri setinin kendi zaman çizelgesine göre değil. Bu, bazı grafiklerin (örn. "Bu Ay") güncel ayda boş görünmesine sebep olabilir, bilinen ve kabul edilmiş bir durum.
- **Emoji yerine `components/Icons.jsx`'teki içi boş (outline) SVG ikonlar** kullanılıyor — yeni bir ikon gerektiğinde oraya eklenip import edilmeli.
- **PDF raporu** (`ReportsPage.jsx`), Türkçe karakter desteği için `public/fonts/Roboto-*.ttf` dosyalarını çalışma anında `fetch` ile okuyup jsPDF'e gömüyor (`loadFont` fonksiyonu).
- **Chatbot** (`ChatBot.jsx`) tamamen kural tabanlı — gerçek bir LLM'e bağlı değil. Kişi/takım/alt-tip eşleştirmesini normalize + Levenshtein mesafesiyle (bulanık string eşleştirme) yapıyor, dış API çağrısı yok.

## Veritabanı şeması (özet)

- `requests` — Excel'den aktarılan tüm talepler (`talep_id`, `acilis_tarihi`, `acan_kisi`, `analiz`, `analiz_ikincigoz`, `qa`, `ekip`, `tip`, `alt_tip`, `surec_adimi`, `aciklama`, `durum`, `lansman_tarihi`)
- `users` — `username` (aslında e-posta), `password_hash`, `full_name`, `role` (DEFAULT 'Analist', **kullanılmıyor** — hiçbir route veya frontend kodu okumuyor), `reset_token`, `reset_token_expires`
- `teams` — 7 gerçek takım kodu (`TEAM-K-BO-SMARTCAN` vb.)

`backend/seed.js` çalıştırılınca `requests` ve `teams` tabloları **sıfırdan** doldurulur (`users` tablosuna dokunmaz). Şema `db.js`'teki `initDb()` içinde `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE ADD COLUMN IF NOT EXISTS` göçleriyle idempotent şekilde kuruluyor — ayrı bir migration aracı yok.

## Sık kullanılan komutlar

```bash
# Backend başlat
cd backend && npm run dev

# Veriyi sıfırla/yeniden yükle
cd backend && npm run seed

# Frontend başlat
npm run dev
```

## Devam eden çalışma (commit edilmemiş)

- `Login.jsx` + `index.css`: giriş ekranı split-screen tasarıma geçiriliyor (`login-split-left/right`), sağda form/solda `login-image2.png`. **`public/login-image2.png` kullanılıyor, `public/login-image.png` ise untracked ve hiçbir yerde referans edilmiyor** — muhtemelen bir önceki deneme, commit'ten önce silinmeli veya kullanılmalı.

## Bilinen eksikler / temizlik gerektiren noktalar

- Otomatik test yok (ne frontend ne backend).
- CORS sınırsız açık (`cors()` parametresiz — her origin kabul ediliyor).
- Login/signup/forgot-password uçlarında rate limiting yok — brute-force'a açık.
- Şifre sıfırlama gerçek e-posta göndermiyor, token doğrudan response'ta dönüyor (bkz. yukarıdaki "Önemli kararlar").
- Kök `package.json`'daki `pg` bağımlılığı **frontend'de hiç import edilmiyor** — muhtemelen yanlışlıkla backend yerine köke eklendi, kaldırılabilir.
- `users.role` sütunu şemada var ama hiçbir yerde okunmuyor/yazılmıyor (signup her zaman default `'Analist'` bırakıyor) — ya kullanılmalı ya da kaldırılmalı.
- `GET /api/requests` sayfalama yapmadan tüm kayıtları dönüyor; veri seti büyürse frontend'e taşınan sayfalama/sıralama mantığı ölçeklenmeyebilir.
- Canlıya alınmadı, deployment/CI pipeline'ı yok.

## Future work / yapılabilecekler

- **Gerçek aktivite kaydı**: `activity_log` tablosu eklenip `/approve`, `/reject` gibi durum değiştiren işlemler zaman damgası + kullanıcıyla loglanabilir (bkz. "sahte veri üretmeyiz" kararı — bundan sonraki gerçek işlemler için).
- **E-posta entegrasyonu**: şifre sıfırlama linkini gerçekten mail atacak bir servis (SendGrid/SMTP) bağlanabilir, demo akışı kaldırılabilir.
- **Rol tabanlı yetkilendirme**: `users.role` sütunu zaten var — onaylama/reddetme gibi işlemler belirli rollerle sınırlandırılabilir.
- **Backend sayfalama/filtreleme**: `GET /api/requests` için `?page=&limit=&durum=` gibi query parametreleri eklenip ağır işi veritabanına devretmek, 468 kayıttan büyük veri setlerinde faydalı olur.
- **Chatbot'u gerçek bir LLM'e bağlama**: şu an kural tabanlı fuzzy-match motoru var; istenirse Anthropic/OpenAI API'siyle değiştirilebilir (CLAUDE.md'de not edildiği gibi maliyet ~0, henüz istenmedi).
- **Test altyapısı**: en azından backend route'ları için birkaç entegrasyon testi (Vitest/Jest + supertest) başlangıç noktası olabilir.
- **CORS/rate limiting sıkılaştırma**: canlıya çıkmadan önce `cors({ origin: ... })` ile kısıtlama ve `express-rate-limit` gibi bir paket login uçlarına eklenmeli.
- **Deployment**: hâlâ sadece localhost'ta çalışıyor; bir sonraki adım muhtemelen basit bir hosting (Render/Railway + Vercel gibi) kurulumu olur.