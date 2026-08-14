const express = require('express');
const cors = require('cors');
const { pool, initDb } = require('./db');

const requestsRouter = require('./routes/requests');
const authRouter = require('./routes/auth');
const teamsRouter = require('./routes/teams');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ---- Sağlık / bağlantı kontrolü ----
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend çalışıyor 🎉' });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ connected: true, time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// ---- Konuya göre bölünmüş route'lar ----
app.use('/api/requests', requestsRouter);
app.use('/api', authRouter);      // /api/signup, /api/login, /api/forgot-password, /api/reset-password
app.use('/api/teams', teamsRouter);

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend çalışıyor: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Veritabanı bağlantı hatası:', err.message);
  });