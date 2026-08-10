import { useState } from 'react';
import { DATA, fmtDate } from '../data/dummyData';
import RequestTimeline from './RequestTimeline';

export default function LaunchesPage({ search }) {
  const [selected, setSelected] = useState(null);

  let rows = DATA.filter((r) => r.lansman).sort((a, b) => b.lansman - a.lansman);

  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((r) => String(r.id).includes(q) || r.acanKisi.toLowerCase().includes(q));
  }

  const exportCSV = () => {
    const header = ['TALEP_ID', 'LANSMAN_TARIHI', 'ACAN_KISI', 'TAKIM', 'TALEP_TIPI'];
    const lines = [header.join(';')];
    rows.forEach((r) => {
      lines.push([r.id, fmtDate(r.lansman), r.acanKisi, r.ekip, r.tip].join(';'));
    });
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lansmanlar.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="page-head">
        <div className="subtitle">Lansmanı tamamlanmış talepler — bir satıra tıklayarak süreç zaman çizelgesini gör</div>
        <div className="ph-actions">
          <button className="btn primary" onClick={exportCSV}>⬇ CSV indir</button>
        </div>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Talep ID</th><th>Lansman Tarihi</th><th>Açan Kişi</th>
                <th>Takım</th><th>Talep Tipi</th><th>Süre (gün)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const days = Math.round((r.lansman - r.acilis) / 86400000);
                return (
                  <tr key={r.idx} style={{ cursor: 'pointer' }} onClick={() => setSelected(r)}>
                    <td>{r.id}</td>
                    <td>{fmtDate(r.lansman)}</td>
                    <td className="name">{r.acanKisi}</td>
                    <td>{r.ekip.replace('TEAM-K-BO-', '')}</td>
                    <td>{r.tip}</td>
                    <td>{days}</td>
                  </tr>
                );
              })}
              {rows.length === 0 && <tr><td colSpan="6">Sonuç bulunamadı</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <RequestTimeline request={selected} onClose={() => setSelected(null)} />
    </>
  );
}