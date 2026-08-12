import { DATA, RANGE_END, monthKey, fmtDate } from '../data/dummyData';
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

export default function ReportsPage({ theme }) {
  const thisMonth = monthKey(RANGE_END);
  const lastMonthDate = new Date(RANGE_END.getFullYear(), RANGE_END.getMonth() - 1, 1);
  const lastMonth = monthKey(lastMonthDate);

  const launchesThis = DATA.filter((r) => r.lansman && monthKey(r.lansman) === thisMonth).length;
  const launchesLast = DATA.filter((r) => r.lansman && monthKey(r.lansman) === lastMonth).length;
  const openedThis = DATA.filter((r) => monthKey(r.acilis) === thisMonth).length;
  const openedLast = DATA.filter((r) => monthKey(r.acilis) === lastMonth).length;
  const closedThis = DATA.filter((r) => r.durum === 'Kapalı' && monthKey(r.acilis) === thisMonth).length;
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
          <button className="btn primary" onClick={exportCSV}>⬇ Filtreli veriyi CSV indir</button>
        </div>
      </div>

      <div className="compare-grid">
        <CompareCard label="Lansman (Bu Ay)" cur={launchesThis} prev={launchesLast} sub="Geçen ay" />
        <CompareCard label="Açılan Talep (Bu Ay)" cur={openedThis} prev={openedLast} sub="Geçen ay" />
        <CompareCard label="Kapanan Talep (Bu Ay)" cur={closedThis} prev={closedLast} sub="Geçen ay" />
      </div>

      <CompareChart theme={theme} />
    </>
  );
}