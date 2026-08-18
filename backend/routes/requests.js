const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const requireAuth = require('../middleware/auth');

// GET /api/requests — tüm talepleri getir
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM requests ORDER BY acilis_tarihi DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/requests/:id/approve — bir talebi onayla
router.patch('/:id/approve', requireAuth, async (req, res) => {
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

// PATCH /api/requests/:id/reject — bir talebi reddet
router.patch('/:id/reject', requireAuth, async (req, res) => {
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

module.exports = router;