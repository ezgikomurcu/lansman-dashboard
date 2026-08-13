import { useState, useRef, useEffect } from 'react';

const PAGE_TITLES = {
  overview: 'Genel Bakış',
  launches: 'Lansmanlar',
  pending: 'Bekleyen Talepler',
  people: 'Kişi Performansı',
  teams: 'Takım Dağılımı',
  reports: 'Raporlar'
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
        <div className="subtitle">Tüm ekip · seçili dönem</div>
      </div>
      <div className="topbar-actions">
        {SEARCHABLE_VIEWS.includes(activeView) && (
          <div className="search-box">
            <input
              type="text"
              placeholder="Talep ID veya kişi ara..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}

        <div className="icon-btn-wrap" ref={notifRef}>
          <div className="icon-btn" onClick={() => setShowNotif((s) => !s)}>
            🔔
            {notifications.length > 0 && <span className="badge-dot">{notifications.length}</span>}
          </div>
          {showNotif && (
            <div className="dropdown show">
              <div className="dropdown-head">
                Bildirimler
                <span className="dropdown-close" onClick={() => setShowNotif(false)}>✕</span>
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

        <div className="icon-btn" onClick={onToggleTheme}>
          {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌸'}
        </div>
      </div>
    </div>
  );
}