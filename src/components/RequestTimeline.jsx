import { fmtDate, RANGE_END } from '../data/dummyData';

function computeStages(r) {
  const totalDays = r.lansman ? Math.max((r.lansman - r.acilis) / 86400000, 4) : 20;
  const d2 = new Date(r.acilis.getTime() + totalDays * 0.25 * 86400000);
  const d3 = new Date(r.acilis.getTime() + totalDays * 0.5 * 86400000);
  const d4 = new Date(r.acilis.getTime() + totalDays * 0.75 * 86400000);
  const now = RANGE_END;
  return [
    { label: 'Talep Açıldı', date: r.acilis, person: r.acanKisi, done: true },
    { label: 'Analiz', date: d2 <= now ? d2 : null, person: r.analiz, done: d2 <= now },
    { label: '2. Göz Kontrolü', date: d3 <= now ? d3 : null, person: r.ikinciGoz, done: d3 <= now && r.durum !== 'Açık' },
    { label: 'QA Onayı', date: d4 <= now ? d4 : null, person: r.qa, done: !!r.lansman || r.durum === 'Kapalı' },
    { label: 'Lansman', date: r.lansman, person: null, done: !!r.lansman }
  ];
}

export default function RequestTimeline({ request, onClose }) {
  if (!request) return null;
  const stages = computeStages(request);

  return (
    <div className="modal-overlay show">
      <div className="modal-card">
        <div className="modal-close" onClick={onClose}>✕</div>
        <h3>Talep #{request.id}</h3>
        <div className="m-sub">
          {request.aciklama} · {request.ekip.replace('TEAM-K-BO-', '')} · {request.tip}
        </div>

        <div className="timeline">
          {stages.map((s, i) => (
            <div className={`tl-item ${s.done ? 'done' : 'pending'}`} key={i}>
              <div className="tl-title">{s.label}</div>
              <div className="tl-date">{s.date ? fmtDate(s.date) : 'Bekliyor'}</div>
              {s.person && <div className="tl-person">{s.person}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}