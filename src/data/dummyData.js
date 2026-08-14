// ============ SABİT LİSTELER (arayüzde referans için) ============
export const PEOPLE = [
  "Ayşe Kaya", "Mert Demir", "Zeynep Arslan", "Burak Yıldız",
  "Elif Şahin", "Cem Öztürk", "Deniz Aydın", "Selin Kurt"
];

export let TEAMS = [];

export const API_URL = 'http://localhost:3000';

// ============ GERÇEK VERİ — artık backend'den geliyor ============
export let DATA = [];
export let RANGE_END = new Date();

export async function loadDataFromAPI() {
  const [reqRes, teamsRes] = await Promise.all([
    fetch(`${API_URL}/api/requests`),
    fetch(`${API_URL}/api/teams`)
  ]);

  if (!reqRes.ok) throw new Error('Backend’den talep verisi alınamadı (' + reqRes.status + ')');
  if (!teamsRes.ok) throw new Error('Backend’den takım verisi alınamadı (' + teamsRes.status + ')');

  const rows = await reqRes.json();
  const teamRows = await teamsRes.json();

  DATA = rows.map((r, i) => ({
    idx: i,
    dbId: r.id,
    id: r.talep_id,
    acilis: new Date(r.acilis_tarihi),
    durum: r.durum,
    acanKisi: r.acan_kisi,
    analiz: r.analiz,
    ikinciGoz: r.analiz_ikincigoz,
    qa: r.qa,
    ekip: r.ekip,
    tip: r.tip,
    aciklama: r.aciklama,
    lansman: r.lansman_tarihi ? new Date(r.lansman_tarihi) : null,
    altTip: r.alt_tip,
    surecAdimi: r.surec_adimi
  }));

  TEAMS = teamRows.map((t) => t.code);

  RANGE_END = new Date();
}

// ============ YARDIMCI FONKSİYONLAR (değişmedi) ============
export function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

export function monthKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

export function monthLabel(k) {
  const [y, m] = k.split('-');
  const aylar = ['Oca','Şub','Mar','Nis','May','Haz','Tem','Ağu','Eyl','Eki','Kas','Ara'];
  return aylar[Number(m) - 1] + " '" + y.slice(2);
}

export function lastNMonths(n, endDate) {
  const arr = [];
  const d = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  for (let i = n - 1; i >= 0; i--) {
    const dd = new Date(d.getFullYear(), d.getMonth() - i, 1);
    arr.push(monthKey(dd));
  }
  return arr;
}