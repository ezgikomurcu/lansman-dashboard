import { useState } from 'react';
import { DATA, PEOPLE } from '../data/dummyData';
import PersonModalChart from './charts/PersonModalChart';

export default function PeoplePage() {
  const [selected, setSelected] = useState(null); // hangi kişi seçili? (null = modal kapalı)

  return (
    <>
      <div className="page-head">
        <div className="subtitle">Bir kişiye tıklayarak detaylı performans profilini gör</div>
      </div>

      <div className="people-grid">
        {PEOPLE.map((p) => {
          const rows = DATA.filter((r) => r.acanKisi === p);
          const launches = rows.filter((r) => r.lansman).length;
          const pending = rows.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor').length;
          const initials = p.split(' ').map((w) => w[0]).join('');

          return (
            <div className="person-card" key={p} onClick={() => setSelected(p)}>
              <div className="p-avatar">{initials}</div>
              <div className="p-name">{p}</div>
              <div className="p-role">{rows.length} toplam talep</div>
              <div className="p-stats">
                <div className="p-stat"><b>{launches}</b><span>Lansman</span></div>
                <div className="p-stat"><b>{pending}</b><span>Bekleyen</span></div>
              </div>
            </div>
          );
        })}
      </div>

      {selected && (
        <div className="modal-overlay show">
          <div className="modal-card">
            <div className="modal-close" onClick={() => setSelected(null)}>✕</div>
            <h3>{selected}</h3>
            <div className="m-sub">
              {DATA.filter((r) => r.acanKisi === selected).length} toplam talep
            </div>

            <div className="grid-2" style={{ marginBottom: 16 }}>
              <div className="kpi-card">
                <div className="k-label">Toplam Lansman</div>
                <div className="k-value">
                  {DATA.filter((r) => r.acanKisi === selected && r.lansman).length}
                </div>
              </div>
              <div className="kpi-card">
                <div className="k-label">Bekleyen Talep</div>
                <div className="k-value">
                  {DATA.filter((r) => r.acanKisi === selected && (r.durum === 'Açık' || r.durum === 'Onay Bekleniyor')).length}
                </div>
              </div>
            </div>

            <PersonModalChart personName={selected} />
          </div>
        </div>
      )}
    </>
  );
}