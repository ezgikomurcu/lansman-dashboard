const express = require('express');
const cors = require('cors');
const { pool, initDb } = require('./db');

const bcrypt = require("bcrypt");

const app = express();
const PORT = 3000;

const crypto = require("crypto");

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend çalışıyor 🎉' });
});

// Veritabanı bağlantısını test eden uç nokta
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ connected: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// ---- Tüm talepleri getir ----
app.get('/api/requests', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM requests ORDER BY acilis_tarihi DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Bir talebi onayla ----
app.patch('/api/requests/:id/approve', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE requests
       SET durum = 'Kapalı', lansman_tarihi = COALESCE(lansman_tarihi, NOW())
       WHERE id = $1
       RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Talep bulunamadı' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Bir talebi reddet ----
app.patch('/api/requests/:id/reject', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE requests SET durum = 'Reddedildi' WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Talep bulunamadı' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Tüm takımları getir ----
app.get('/api/teams', async (req, res) => {
  try {
    const result = await pool.query('SELECT code FROM teams ORDER BY code');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Kayıt ol ----
app.post('/api/signup', async (req, res) => {
  try {
    const { fullName, username, password } = req.body;
    if (!fullName || !username || !password) {
      return res.status(400).json({ error: 'Tüm alanları doldurmalısın.' });
    }
    const existing = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Bu kullanıcı adı zaten alınmış.' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, username, full_name',
      [username, passwordHash, fullName]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Giriş yap ----
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Kullanıcı adı ve şifre gerekli.' });
    }
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
    }
    res.json({ user: { id: user.id, username: user.username, full_name: user.full_name } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Şifremi unuttum: sıfırlama linki üret ----
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Kullanıcı adı gerekli.' });

    const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bu kullanıcı adıyla bir hesap bulunamadı.' });
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika geçerli

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE username = $3',
      [token, expires, username]
    );

    // Gerçek üretimde bu link e-posta ile gönderilirdi; biz demo olduğu için direkt döndürüyoruz.
    res.json({ resetToken: token, expiresInMinutes: 15 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- Token ile yeni şifreyi kaydet ----
app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token ve yeni şifre gerekli.' });
    }

    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Bağlantının süresi dolmuş veya geçersiz.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [passwordHash, result.rows[0].id]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend çalışıyor: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Veritabanı bağlantı hatası:', err.message);
  });