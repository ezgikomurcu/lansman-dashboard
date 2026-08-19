import { useState, useEffect } from 'react';
import { DATA, RANGE_END, fmtDate, loadDataFromAPI, API_URL } from '../data/dummyData';
import Pagination from './Pagination';
import SurecAdimiChart from './charts/SurecAdimiChart';

const PAGE_SIZE = 20;

export default function ApprovalQueue({ search, onDataChange, onNotify, user }) {
  const [loadingId, setLoadingId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [search]);

  const activeAll = DATA.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor');

  let items = activeAll.sort((a, b) => a.acilis - b.acilis);

  if (search) {
    const q = search.toLowerCase();
    items = items.filter((r) => String(r.id).includes(q) || r.acanKisi.toLowerCase().includes(q));
  }

  const breach = items.filter((r) => (RANGE_END - r.acilis) / 86400000 > 10).length;
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pageItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const doAction = async (dbId, action) => {
    setLoadingId(dbId);
    try {
      const res = await fetch(`${API_URL}/api/requests/${dbId}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Sunucu hatası');
      await loadDataFromAPI();
      onDataChange();
      onNotify(action === 'approve' ? 'Talep onaylandı ✓' : 'Talep reddedildi', 'success');
    } catch (err) {
      onNotify('İşlem başarısız: ' + err.message, 'error');
    }
    setLoadingId(null);
  };

  return (
    <>
      <div className="sla-banner">
        {breach > 0
          ? `⚠ ${breach} talep 10 günden uzun süredir bekliyor — öncelik ver.`
          : '✓ SLA süresini aşan talep yok.'}
      </div>

      <SurecAdimiChart data={activeAll} />

      <div className="queue-list">
        {pageItems.length === 0 && <div className="panel">Bekleyen talep yok.</div>}
        {pageItems.map((r) => {
          const days = Math.round((RANGE_END - r.acilis) / 86400000);
          const isBreach = days > 10;
          const busy = loadingId === r.dbId;
          return (
            <div className="queue-row" key={r.dbId}>
              <div className="q-main">
                <div className="q-id">#{r.id} · {r.ekip}</div>
                <div className="q-desc">{r.aciklama}</div>
                <div className="q-meta">
                  {r.acanKisi} açtı · {fmtDate(r.acilis)} ·{' '}
                  <span className={`sla-tag ${isBreach ? 'breach' : ''}`}>{days} gün bekliyor</span>
                </div>
              </div>
              <div className="q-actions">
                <button className="btn small success" disabled={busy} onClick={() => doAction(r.dbId, 'approve')}>
                  {busy ? '...' : 'Onayla'}
                </button>
                <button className="btn small danger" disabled={busy} onClick={() => doAction(r.dbId, 'reject')}>
                  {busy ? '...' : 'Reddet'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}