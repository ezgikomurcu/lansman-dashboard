// Kök package.json "type":"module" olduğu için bu dosya ESM olarak
// yorumlanıyor — backend/ klasörünün kendi package.json'ı "commonjs"
// dediği için oradaki dosyalar CommonJS kalıyor, Node ikisi arasında
// otomatik interop yapıyor (module.exports → default/named import).
import app from '../backend/app.js';
import { initDb } from '../backend/db.js';

// Vercel her /api/* isteğini bu tek fonksiyona yönlendirir (dosya adındaki
// [...path] Vercel'in "catch-all" API route kuralı — vercel.json'a gerek yok).
// initDb() idempotent (CREATE TABLE IF NOT EXISTS) olduğu için burada cold
// start başına bir kere çalıştırıp Promise'i modül kapsamında cache'liyoruz;
// aynı sıcak fonksiyon örneği sonraki isteklerde onu tekrar beklemez.
let dbReady;

export default async function handler(req, res) {
  if (!dbReady) {
    dbReady = initDb().catch((err) => {
      dbReady = null; // başarısız olursa sonraki istek tekrar denesin
      throw err;
    });
  }
  await dbReady;
  return app(req, res);
}
