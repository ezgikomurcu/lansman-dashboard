import { useState } from 'react';
import { DATA, RANGE_END, monthKey, monthLabel, fmtDate } from '../data/dummyData';
import CompareChart from './charts/CompareChart';

function pct(cur, prev) {
  if (prev === 0) return cur > 0 ? 100 : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

function CompareCard({ label, cur, prev, sub }) {
  const p = pct(cur, prev);
  const up = p >= 0;
  return (
    <div className="compare-card">
      <div className="c-label">{label}</div>
      <div className="c-row">
        <span className="c-value">{cur}</span>
        <span className="c-change" style={{ color: up ? 'var(--teal)' : 'var(--coral)' }}>
          {up ? '▲' : '▼'} {Math.abs(p)}%
        </span>
      </div>
      <div className="c-sub">{sub}: {prev}</div>
    </div>
  );
}

export default function ReportsPage() {
  // Verideki en eski aydan, bugüne kadar TÜM ayları (boş olanlar dahil) üret
function monthsBetweenKeys(startKey, endKey) {
  const [sy, sm] = startKey.split('-').map(Number);
  const [ey, em] = endKey.split('-').map(Number);
  const result = [];
  let y = sy, m = sm;
  while (y < ey || (y === ey && m <= em)) {
    result.push(`${y}-${String(m).padStart(2, '0')}`);
    m++;
    if (m > 12) { m = 1; y++; }
  }
  return result.reverse(); // en yeniden en eskiye
}

const acilisMonths = DATA.map((r) => monthKey(r.acilis)).sort();
const currentMonth = monthKey(RANGE_END);
const minMonth = acilisMonths[0] || currentMonth;
const latestDataMonth = acilisMonths[acilisMonths.length - 1] || currentMonth;
const maxMonth = latestDataMonth > currentMonth ? latestDataMonth : currentMonth;

const availableMonths = monthsBetweenKeys(minMonth, maxMonth);
const defaultMonth = currentMonth;

  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);

  const [y, m] = selectedMonth.split('-').map(Number);
  const lastMonthDate = new Date(y, m - 2, 1);
  const lastMonth = monthKey(lastMonthDate);
  const selectedEndDate = new Date(y, m - 1, 1);

  const launchesThis = DATA.filter((r) => r.lansman && monthKey(r.lansman) === selectedMonth).length;
  const launchesLast = DATA.filter((r) => r.lansman && monthKey(r.lansman) === lastMonth).length;
  const openedThis = DATA.filter((r) => monthKey(r.acilis) === selectedMonth).length;
  const openedLast = DATA.filter((r) => monthKey(r.acilis) === lastMonth).length;
  const closedThis = DATA.filter((r) => r.durum === 'Kapalı' && monthKey(r.acilis) === selectedMonth).length;
  const closedLast = DATA.filter((r) => r.durum === 'Kapalı' && monthKey(r.acilis) === lastMonth).length;

  const exportCSV = () => {
    const header = ['TALEP_ID', 'AcilisTarihi', 'ACAN_KISI', 'TAKIM', 'DURUM', 'LANSMAN_TARIHI'];
    const lines = [header.join(';')];
    DATA.forEach((r) => {
      lines.push([r.id, fmtDate(r.acilis), r.acanKisi, r.ekip, r.durum, r.lansman ? fmtDate(r.lansman) : ''].join(';'));
    });
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lansman_raporu.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-head">
        <div className="subtitle">Dönem karşılaştırması ve dışa aktarım</div>
        <div className="ph-actions">
          <select className="month-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            {availableMonths.map((mk) => (
              <option key={mk} value={mk}>{monthLabel(mk)}</option>
            ))}
          </select>
          <button className="btn primary" onClick={exportCSV}>⬇ Filtreli veriyi CSV indir</button>
        </div>
      </div>

      <div className="compare-grid">
        <CompareCard label={`Lansman (${monthLabel(selectedMonth)})`} cur={launchesThis} prev={launchesLast} sub="Önceki ay" />
        <CompareCard label={`Açılan Talep (${monthLabel(selectedMonth)})`} cur={openedThis} prev={openedLast} sub="Önceki ay" />
        <CompareCard label={`Kapanan Talep (${monthLabel(selectedMonth)})`} cur={closedThis} prev={closedLast} sub="Önceki ay" />
      </div>

      <CompareChart endDate={selectedEndDate} />
    </>
  );
}