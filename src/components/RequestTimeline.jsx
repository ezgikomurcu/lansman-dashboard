import { fmtDate } from '../data/dummyData';

export default function RequestTimeline({ request, onClose }) {
  if (!request) return null;

  const days = request.lansman
    ? Math.round((request.lansman - request.acilis) / 86400000)
    : null;

  return (
    <div className="modal-overlay show">
      <div className="modal-card">
        <div className="modal-close" onClick={onClose}>✕</div>
        <h3>Talep #{request.id}</h3>
        <div className="m-sub">
          {request.aciklama} · {request.ekip.replace('TEAM-K-BO-', '')} · {request.tip}
        </div>

        {request.surecAdimi && (
          <div className="success-box" style={{ marginBottom: 18 }}>
            📍 <b>Süreç durumu:</b> {request.surecAdimi}
          </div>
        )}

        <div className="grid-2" style={{ marginBottom: 18 }}>
          <div className="kpi-card">
            <div className="k-label">Açılış Tarihi</div>
            <div className="k-value" style={{ fontSize: 18 }}>{fmtDate(request.acilis)}</div>
          </div>
          <div className="kpi-card">
            <div className="k-label">Lansman Tarihi</div>
            <div className="k-value" style={{ fontSize: 18 }}>{fmtDate(request.lansman)}</div>
          </div>
        </div>

        <div className="m-sub" style={{ marginBottom: 18 }}>
          Toplam süreç süresi: <b style={{ color: 'var(--text)' }}>{days} gün</b>
        </div>

        <div className="timeline">
          <div className="tl-item done">
            <div className="tl-title">Talebi Açan</div>
            <div className="tl-person">{request.acanKisi}</div>
          </div>
          <div className="tl-item done">
            <div className="tl-title">Analiz</div>
            <div className="tl-person">{request.analiz}</div>
          </div>
          <div className="tl-item done">
            <div className="tl-title">2. Göz Kontrolü</div>
            <div className="tl-person">{request.ikinciGoz}</div>
          </div>
          <div className="tl-item done">
            <div className="tl-title">QA</div>
            <div className="tl-person">{request.qa}</div>
          </div>
        </div>
      </div>
    </div>
  );
}