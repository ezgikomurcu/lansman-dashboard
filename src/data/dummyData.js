// ============ SABİT LİSTELER ============
export const PEOPLE = [
  "Ayşe Kaya", "Mert Demir", "Zeynep Arslan", "Burak Yıldız",
  "Elif Şahin", "Cem Öztürk", "Deniz Aydın", "Selin Kurt"
];

export const TEAMS = [
  "TEAM-K-BO-SMARTCAN", "TEAM-K-BO-MMICING", "TEAM-K-BO-CASEBAN",
  "TEAM-K-BO-DSS", "TEAM-K-BO-KANBANYA", "TEAM-K-BO-CARBON"
];

const TYPES = ["Kampanya", "Postpaid", "Servis"];

const DESCS = [
  "Tarife ücret revizyonu talebi",
  "Yeni kampanya katılım kriteri tanımı",
  "SMS bilgilendirme metni güncelleme",
  "Kanal kapatma işlemi",
  "Segment bazlı teklif güncellemesi",
  "Portföy paket güncellemesi"
];

// ============ RASTGELE ÜRETİM YARDIMCILARI ============
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}
const rnd = seededRandom(42);

function pick(arr) {
  return arr[Math.floor(rnd() * arr.length)];
}

function randDate(start, end) {
  return new Date(start.getTime() + rnd() * (end.getTime() - start.getTime()));
}

// ============ VERİ ÜRETİMİ ============
const RANGE_START = new Date(2023, 0, 1);
export const RANGE_END = new Date(2026, 7, 7); // bugün

export const DATA = [];
for (let i = 0; i < 420; i++) {
  const acilis = randDate(RANGE_START, RANGE_END);
  const statusRoll = rnd();
  let durum, lansman = null;

  if (statusRoll < 0.62) {
    durum = "Kapalı";
    const lag = 4 + rnd() * 30;
    const l = new Date(acilis.getTime() + lag * 86400000);
    if (l <= RANGE_END) lansman = l;
  } else if (statusRoll < 0.82) {
    durum = "Onay Bekleniyor";
  } else {
    durum = "Açık";
  }

  DATA.push({
    idx: i,
    id: 10000000000 + Math.floor(rnd() * 99999),
    acilis,
    durum,
    acanKisi: pick(PEOPLE),
    analiz: pick(PEOPLE),
    ikinciGoz: pick(PEOPLE),
    qa: pick(PEOPLE),
    ekip: pick(TEAMS),
    tip: pick(TYPES),
    aciklama: pick(DESCS),
    lansman
  });
}

// ============ ORTAK YARDIMCI FONKSİYONLAR ============
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