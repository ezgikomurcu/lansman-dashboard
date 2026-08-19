import { useState, useRef, useEffect } from 'react';
import { BellIcon, SearchIcon, MoonIcon, SunIcon } from './Icons';

const PAGE_TITLES = {
  overview: 'Genel Bakış',
  launches: 'Lansmanlar',
  pending: 'Bekleyen Talepler',
  people: 'Kişi Performansı',
  teams: 'Takım Dağılımı',
  reports: 'Raporlar'
};

// Topbar'daki her sayfada aynı "Tüm ekip · seçili dönem" yazıyordu — Lansmanlar/
// Raporlar gibi dönem seçicisi olmayan sayfalarda bu doğrudan yanlış bilgiydi.
const PAGE_SUBTITLES = {
  overview: 'Tüm ekip · seçili dönem',
  launches: 'Lansmanı tamamlanan talepler',
  pending: 'Onay bekleyen açık talepler',
  people: 'Kişi bazlı performans özeti',
  teams: 'Takım bazlı hacim ve durum',
  reports: 'Aylık karşılaştırma ve dışa aktarım'
};

const SEARCHABLE_VIEWS = ['pending', 'launches', 'people'];

export default function Topbar({ activeView, search, onSearchChange, notifications, theme, onToggleTheme }) {
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="topbar">
      <div>
        <h2>{PAGE_TITLES[activeView]}</h2>
        <div className="subtitle">{PAGE_SUBTITLES[activeView]}</div>
      </div>
      <div className="topbar-actions">
        {SEARCHABLE_VIEWS.includes(activeView) && (
          <div className="search-box">
            <SearchIcon aria-hidden="true" />
            <label htmlFor="topbar-search" className="sr-only">Talep ID veya kişi ara</label>
            <input
              id="topbar-search"
              type="text"
              placeholder="Talep ID veya kişi ara..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        <div className="icon-btn-wrap" ref={notifRef}>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setShowNotif((s) => !s)}
            aria-haspopup="true"
            aria-expanded={showNotif}
            aria-label={`Bildirimler${notifications.length > 0 ? ` (${notifications.length} yeni)` : ''}`}
          >
             <BellIcon />
            {notifications.length > 0 && <span className="badge-dot">{notifications.length}</span>}
          </button>
          {showNotif && (
            <div className="dropdown show" role="menu" onKeyDown={(e) => { if (e.key === 'Escape') setShowNotif(false); }}>
              <div className="dropdown-head">
                Bildirimler
                <button type="button" className="dropdown-close" onClick={() => setShowNotif(false)} aria-label="Kapat">✕</button>
              </div>
              {notifications.length === 0 && <div className="notif-item">Yeni bildirim yok</div>}
              {notifications.map((n, i) => (
                <div className="notif-item" key={i}>
                  <div className={`n-dot ${n.cls}`}></div>
                  <div><b>{n.title}</b>{n.desc}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="icon-btn" onClick={onToggleTheme} aria-label="Temayı değiştir">
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </div>
  );
}