# Launchly — Proje Bağlamı

Bu dosya, projeye yeni başlayan bir Claude oturumunun (ya da geliştiricinin) hızlıca bağlam kazanması için yazıldı.

## Ne bu proje

Turkcell C6 ekibi için staj projesi — talep/analiz/lansman süreçlerini gösteren bir yönetici dashboard'u. Gerçek Excel verisiyle (468 kayıt) çalışıyor, kişi isimleri hariç (onlar üretilmiş/dummy).

## Mimari

React (Vite, :5173) ←fetch→ Express (Node, :3000) ←pg→ PostgreSQL (lansman_db)

- Frontend tamamen `DATA`/`TEAMS`/`PEOPLE` gibi modül-seviyesi `let` değişkenlerinden besleniyor (`src/data/dummyData.js`). `loadDataFromAPI()` çağrılınca bu değişkenler backend'den taze veriyle dolduruluyor — bileşenler bunları import edip **otomatik güncel** kalıyor.
- Backend `routes/` altında konusuna göre bölünmüş: `requests.js`, `auth.js`, `teams.js`. `server.js` sadece bunları `/api/...` altına bağlıyor.
- JWT sadece **durum değiştiren** uç noktalarda zorunlu (`/approve`, `/reject`) — salt okuma uç noktaları (`GET /api/requests` vb.) korumasız, çünkü veri login ekranından önce yükleniyor (bilinçli tasarım kararı).

## Önemli kurallar / kararlar

- **Sahte veri üretmeyiz.** Excel'de olmayan bir alanı (örn. geçmişe dönük "kim ne zaman onayladı" kaydı) asla uydurmadık — `activity_log` bilerek eklenmedi, "bundan sonraki gerçek işlemler kaydedilsin" ilkesi benimsendi ama henüz uygulanmadı.
- **`RANGE_END`**, gerçek `new Date()` — veri setinin kendi zaman çizelgesine göre değil. Bu, bazı grafiklerin (örn. "Bu Ay") güncel ayda boş görünmesine sebep olabilir, bilinen ve kabul edilmiş bir durum.
- **Emoji yerine `components/Icons.jsx`'teki içi boş (outline) SVG ikonlar** kullanılıyor — yeni bir ikon gerektiğinde oraya eklenip import edilmeli.
- **PDF raporu** (`ReportsPage.jsx`), Türkçe karakter desteği için `public/fonts/Roboto-*.ttf` dosyalarını çalışma anında `fetch` ile okuyup jsPDF'e gömüyor (`loadFont` fonksiyonu).

## Veritabanı şeması (özet)

- `requests` — Excel'den aktarılan tüm talepler (`talep_id`, `acilis_tarihi`, `acan_kisi`, `analiz`, `analiz_ikincigoz`, `qa`, `ekip`, `tip`, `alt_tip`, `surec_adimi`, `aciklama`, `durum`, `lansman_tarihi`)
- `users` — `username` (aslında e-posta), `password_hash`, `full_name`, `reset_token`, `reset_token_expires`
- `teams` — 7 gerçek takım kodu (`TEAM-K-BO-SMARTCAN` vb.)

`backend/seed.js` çalıştırılınca `requests` ve `teams` tabloları **sıfırdan** doldurulur (`users` tablosuna dokunmaz).

## Sık kullanılan komutlar

```bash
# Backend başlat
cd backend && npm run dev

# Veriyi sıfırla/yeniden yükle
cd backend && npm run seed

# Frontend başlat
npm run dev
```

## Devam eden / yapılmamış işler

- Otomatik test yok
- CORS sınırsız açık
- Login'de rate limiting yok
- Canlıya alınmadı
- Chatbot kural tabanlı (gerçek AI'a bağlanmadı, maliyet net ~0 ama henüz istenmedi)