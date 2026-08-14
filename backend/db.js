require('dotenv').config();

const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS requests (
      id SERIAL PRIMARY KEY,
      talep_id BIGINT NOT NULL,
      acilis_tarihi TIMESTAMP NOT NULL,
      acan_kisi TEXT NOT NULL,
      analiz TEXT,
      analiz_ikincigoz TEXT,
      qa TEXT,
      ekip TEXT,
      tip TEXT,
      aciklama TEXT,
      durum TEXT NOT NULL,
      lansman_tarihi TIMESTAMP
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Analist'
    )
  `);

  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name TEXT');
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token TEXT');
  await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP');

  await pool.query('ALTER TABLE requests ADD COLUMN IF NOT EXISTS alt_tip TEXT');
  await pool.query('ALTER TABLE requests ADD COLUMN IF NOT EXISTS surec_adimi TEXT');

  await pool.query(`
  CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    code TEXT NOT NULL UNIQUE
  )
`);

  console.log('Veritabanı tabloları hazır ✅');
}

module.exports = { pool, initDb };