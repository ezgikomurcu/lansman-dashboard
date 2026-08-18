import { useState, useEffect } from 'react';
import { DATA, fmtDate } from '../data/dummyData';
import RequestTimeline from './RequestTimeline';
import Pagination from './Pagination';

const PAGE_SIZE = 20;

const COLUMNS = [
  { key: 'id', label: 'Talep ID' },
  { key: 'lansman', label: 'Lansman Tarihi' },
  { key: 'acanKisi', label: 'Açan Kişi' },
  { key: 'ekip', label: 'Takım' },
  { key: 'tip', label: 'Talep Tipi' },
  { key: 'days', label: 'Süre (gün)' }
];

export default function LaunchesPage({ search }) {
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState('lansman');
  const [sortDir, setSortDir] = useState('desc');

  useEffect(() => { setPage(1); }, [search]);

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  let rows = DATA.filter((r) => r.lansman).map((r) => ({
    ...r,
    days: Math.round((r.lansman - r.acilis) / 86400000)
  }));

  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((r) => String(r.id).includes(q) || r.acanKisi.toLowerCase().includes(q));
  }

  rows.sort((a, b) => {
    let av = a[sortBy];
    let bv = b[sortBy];
    if (av instanceof Date) { av = av.getTime(); bv = bv.getTime(); }
    if (typeof av === 'string') { av = av.toLowerCase(); bv = bv.toLowerCase(); }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const pageRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
        <div className="subtitle">Lansmanı tamamlanmış talepler — sütun başlığına tıklayarak sırala, satıra tıklayarak zaman çizelgesini gör</div>
        <div className="ph-actions">
          <button className="btn primary" onClick={exportCSV}>⬇ CSV indir</button>
        </div>
      </div>

      <div className="panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {COLUMNS.map((c) => (
                  <th key={c.key} style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => toggleSort(c.key)}>
                    {c.label} {sortBy === c.key ? (sortDir === 'asc' ? '▲' : '▼') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.idx} style={{ cursor: 'pointer' }} onClick={() => setSelected(r)}>
                  <td>{r.id}</td>
                  <td>{fmtDate(r.lansman)}</td>
                  <td className="name">{r.acanKisi}</td>
                  <td>{r.ekip}</td>
                  <td>{r.tip}</td>
                  <td>{r.days}</td>
                </tr>
              ))}
              {pageRows.length === 0 && <tr><td colSpan="6">Sonuç bulunamadı</td></tr>}
            </tbody>
          </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      <RequestTimeline request={selected} onClose={() => setSelected(null)} />
    </>
  );
}