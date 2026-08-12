import { DATA, RANGE_END, fmtDate } from '../data/dummyData';

export default function ApprovalQueue({ search, onDataChange }) {
  let items = DATA.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor')
    .sort((a, b) => a.acilis - b.acilis);

  if (search) {
    const q = search.toLowerCase();
    items = items.filter((r) => String(r.id).includes(q) || r.acanKisi.toLowerCase().includes(q));
  }

  const breach = items.filter((r) => (RANGE_END - r.acilis) / 86400000 > 10).length;

  const approve = (idx) => {
    const rec = DATA.find((r) => r.idx === idx);
    rec.durum = 'Kapalı';
    rec.lansman = rec.lansman || RANGE_END;
    onDataChange();
  };

  const reject = (idx) => {
    const rec = DATA.find((r) => r.idx === idx);
    rec.durum = 'Reddedildi';
    onDataChange();
  };

  return (
    <>
      <div className="sla-banner">
        {breach > 0
          ? `⚠ ${breach} talep 10 günden uzun süredir bekliyor — öncelik ver.`
          : '✓ SLA süresini aşan talep yok.'}
      </div>

      <div className="queue-list">
        {items.length === 0 && <div className="panel">Bekleyen talep yok.</div>}
        {items.map((r) => {
          const days = Math.round((RANGE_END - r.acilis) / 86400000);
          const isBreach = days > 10;
          return (
            <div className="queue-row" key={r.idx}>
              <div className="q-main">
                <div className="q-id">#{r.id} · {r.ekip.replace('TEAM-K-BO-', '')}</div>
                <div className="q-desc">{r.aciklama}</div>
                <div className="q-meta">
                  {r.acanKisi} açtı · {fmtDate(r.acilis)} ·{' '}
                  <span className={`sla-tag ${isBreach ? 'breach' : ''}`}>{days} gün bekliyor</span>
                </div>
              </div>
              <div className="q-actions">
                <button className="btn small success" onClick={() => approve(r.idx)}>Onayla</button>
                <button className="btn small danger" onClick={() => reject(r.idx)}>Reddet</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}