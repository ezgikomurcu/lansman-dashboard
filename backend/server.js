const express = require('express');
const cors = require('cors');
const { pool, initDb } = require('./db');

const app = express();
const PORT = 3000;

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

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend çalışıyor: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Veritabanı bağlantı hatası:', err.message);
  });