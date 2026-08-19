import { useState } from 'react';
import { DATA, fmtDate, shortTeam } from '../data/dummyData';
import RequestTimeline from './RequestTimeline';
import Pagination from './Pagination';

const PAGE_SIZE = 20;

const TIP_BADGE = {
  Kampanya: 'tip-kampanya',
  Postpaid: 'tip-postpaid',
  Servis: 'tip-servis'
};

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

  // Effect yerine render sırasında state ayarı: React'in önerdiği desen —
  // search değişince sayfayı senkron biçimde 1'e döndürür, ekstra render/commit yaratmaz.
  const [prevSearch, setPrevSearch] = useState(search);
  if (search !== prevSearch) {
    setPrevSearch(search);
    setPage(1);
  }

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
        <div className="subtitle">Tamamlanan lansmanlara göz at</div>
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
                  <th key={c.key} aria-sort={sortBy === c.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    <button type="button" className="th-sort-btn" onClick={() => toggleSort(c.key)}>
                      {c.label}
                      <span className={`sort-icon ${sortBy === c.key ? 'active' : ''}`}>
                        {sortBy === c.key ? (sortDir === 'asc' ? '▲' : '▼') : '⇅'}
                      </span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r) => (
                <tr key={r.idx} className="row-clickable" onClick={() => setSelected(r)} tabIndex={0} role="button" onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelected(r); } }}>
                  <td><span className="id-chip">{r.id}</span></td>
                  <td>{fmtDate(r.lansman)}</td>
                  <td className="name">{r.acanKisi}</td>
                  <td title={r.ekip}>{shortTeam(r.ekip)}</td>
                  <td><span className={`badge ${TIP_BADGE[r.tip] || ''}`}>{r.tip}</span></td>
                  <td className="num">{r.days}</td>
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