import { useState } from 'react';
import { DATA, RANGE_END, PEOPLE } from '../data/dummyData';
import PersonModalChart from './charts/PersonModalChart';
import Modal from './Modal';
import { CalendarIcon } from './Icons';

const QUICK_RANGES = [
  { key: 90, label: 'Son 90 gün' },
  { key: 365, label: 'Son 12 ay' },
  { key: 'all', label: 'Tüm zamanlar' }
];

export default function PeoplePage({ theme, search }) {
  const [selected, setSelected] = useState(null);
  const [rangeKey, setRangeKey] = useState('all');
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  let filteredData = DATA;
  if (rangeKey === 'custom' && customStart && customEnd) {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
    filteredData = DATA.filter((r) => r.acilis >= start && r.acilis <= end);
  } else if (typeof rangeKey === 'number') {
    filteredData = DATA.filter((r) => (RANGE_END - r.acilis) / 86400000 <= rangeKey);
  }

  const chartEndDate = rangeKey === 'custom' && customEnd ? new Date(customEnd) : RANGE_END;
  let monthsToShow = 12;
  if (rangeKey === 90) {
    monthsToShow = 3;
  } else if (rangeKey === 'all' && filteredData.length) {
    const oldest = filteredData.reduce((min, r) => (r.acilis < min ? r.acilis : min), filteredData[0].acilis);
    monthsToShow = Math.max(
      12,
      (RANGE_END.getFullYear() - oldest.getFullYear()) * 12 + (RANGE_END.getMonth() - oldest.getMonth()) + 1
    );
  } else if (rangeKey === 'custom' && customStart && customEnd) {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    monthsToShow = Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1);
  }

  let people = PEOPLE;
  if (search) {
    const q = search.toLowerCase();
    people = people.filter((p) => p.toLowerCase().includes(q));
  }

  const applyCustomRange = () => {
    if (customStart && customEnd) {
      setRangeKey('custom');
      setShowCustomPicker(false);
    }
  };

  const customLabel =
    rangeKey === 'custom' && customStart && customEnd ? `${customStart} → ${customEnd}` : 'Özel Aralık';

  return (
    <>
      <div className="page-head">
        <div className="subtitle">Bir kişiye tıklayarak detaylı performans profilini gör</div>
      </div>

      <div className="filters" style={{ position: 'relative' }}>
        <div className="quick-range">
          {QUICK_RANGES.map((r) => (
            <button
              key={r.key}
              className={`qr-btn ${rangeKey === r.key ? 'active' : ''}`}
              onClick={() => {
                setRangeKey(r.key);
                setShowCustomPicker(false);
              }}
            >
              {r.label}
            </button>
          ))}
          <button
            className={`qr-btn ${rangeKey === 'custom' ? 'active' : ''}`}
            onClick={() => setShowCustomPicker((v) => !v)}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <CalendarIcon /> {customLabel}
          </button>
        </div>

        {showCustomPicker && (
          <div className="custom-range-panel">
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="people-custom-start">Başlangıç</label>
              <input id="people-custom-start" type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label htmlFor="people-custom-end">Bitiş</label>
              <input id="people-custom-end" type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
            </div>
            <button className="btn primary small" onClick={applyCustomRange}>Uygula</button>
          </div>
        )}
      </div>

      <div className="people-grid">
        {people.length === 0 && <div className="panel">Sonuç bulunamadı</div>}
        {people.map((p) => {
          const rows = filteredData.filter((r) => r.acanKisi === p);
          const launches = rows.filter((r) => r.lansman).length;
          const pending = rows.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor').length;
          const initials = p.split(' ').map((w) => w[0]).join('');

          return (
            <button type="button" className="person-card" key={p} onClick={() => setSelected(p)}>
              <div className="p-head">
                <div className="p-avatar">{initials}</div>
                <div className="p-head-text">
                  <div className="p-name">{p}</div>
                  <div className="p-role">{rows.length} toplam talep</div>
                </div>
              </div>
              <div className="p-stats">
                <div className="p-stat"><b>{launches}</b><span>Lansman</span></div>
                <div className="p-stat"><b>{pending}</b><span>Bekleyen</span></div>
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <Modal onClose={() => setSelected(null)} titleId="person-title">
          <h3 id="person-title">{selected}</h3>
          <div className="m-sub">
            {filteredData.filter((r) => r.acanKisi === selected).length} toplam talep ·{' '}
            {rangeKey === 'custom' ? customLabel : QUICK_RANGES.find((r) => r.key === rangeKey)?.label}
          </div>

          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div className="kpi-card">
              <div className="k-label">Toplam Lansman</div>
              <div className="k-value">
                {filteredData.filter((r) => r.acanKisi === selected && r.lansman).length}
              </div>
            </div>
            <div className="kpi-card">
              <div className="k-label">Bekleyen Talep</div>
              <div className="k-value">
                {filteredData.filter((r) => r.acanKisi === selected && (r.durum === 'Açık' || r.durum === 'Onay Bekleniyor')).length}
              </div>
            </div>
          </div>

          <PersonModalChart personName={selected} theme={theme} data={filteredData} months={monthsToShow} endDate={chartEndDate} />
        </Modal>
      )}
    </>
  );
}