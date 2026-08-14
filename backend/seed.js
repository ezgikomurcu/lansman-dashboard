const xlsx = require('xlsx');
const path = require('path');
const { pool } = require('./db');

async function seed() {
  const filePath = path.join(__dirname, 'data', 'C6_Lansman_Verisi_Dummy.xlsx');
  const workbook = xlsx.readFile(filePath, { cellDates: true });
  const sheet = workbook.Sheets['C6_BIRLESIK_DUMMY'];
  const rows = xlsx.utils.sheet_to_json(sheet, { raw: true, defval: null });

  console.log(`Excel'den ${rows.length} satır okundu.`);

  // Önce tabloyu temizle (bu script'i istediğin kadar tekrar çalıştırabilirsin, hep sıfırdan başlar)
  await pool.query('TRUNCATE TABLE requests RESTART IDENTITY');

  const REAL_TEAMS = [
    'TEAM-K-BO-SMARTCAN', 'TEAM-K-BO-MMICING', 'TEAM-K-BO-CASEBAN',
    'TEAM-K-BO-DSS', 'TEAM-K-BO-KANBANYA', 'TEAM-K-BO-CARBON', 'TEAM-BO-FT-ANALIZ'
  ];
  await pool.query('TRUNCATE TABLE teams RESTART IDENTITY');
  for (const code of REAL_TEAMS) {
    await pool.query('INSERT INTO teams (code) VALUES ($1)', [code]);
  }
  console.log(`✅ ${REAL_TEAMS.length} takım kodu teams tablosuna eklendi.`);

  for (const row of rows) {
    await pool.query(
      `INSERT INTO requests
        (talep_id, acilis_tarihi, acan_kisi, analiz, analiz_ikincigoz, qa, ekip, tip, aciklama, durum, lansman_tarihi, alt_tip, surec_adimi)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        row.TALEP_ID,
        row.AcilisTarihi,
        row.ACAN_KISI,
        row.ANALIZ,
        row.ANALIZ_IKINCIGOZ,
        row.QA,
        row.ANALIZ_EKIBI,
        row.TALEP_TIPI,
        row.TALEP_ACIKLAMA,
        row.DURUM_,
        row.LANSMAN_TARIHI || null,
        row.Talep_Alt_Tipi,
        row.SUREC_ADIM_BILGISI
      ]
    );
  }

  console.log(`✅ ${rows.length} kayıt requests tablosuna eklendi.`);
  await pool.end();
}

seed().catch((err) => {
  console.error('Seed hatası:', err.message);
  process.exit(1);
});