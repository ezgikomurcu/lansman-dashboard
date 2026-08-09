const NAV_ITEMS = [
  { key: 'overview', label: 'Genel Bakış' },
  { key: 'launches', label: 'Lansmanlar' },
  { key: 'pending', label: 'Bekleyen Talepler' },
  { key: 'people', label: 'Kişi Performansı' },
  { key: 'teams', label: 'Takım Dağılımı' },
  { key: 'reports', label: 'Raporlar' }
];

export default function Sidebar({ activeView, onChangeView, user, onLogout }) {
  const initials = user.username
    .split(/[.\s]/)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">t</div>
        <div>
          <b>turkcell</b>
          <small>C6 Lansman Kontrol Merkezi</small>
        </div>
      </div>

      {NAV_ITEMS.map((item) => (
        <div
          key={item.key}
          className={`nav-item ${activeView === item.key ? 'active' : ''}`}
          onClick={() => onChangeView(item.key)}
        >
          <span className="dot"></span> {item.label}
        </div>
      ))}

      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div>
          <div className="u-name">{user.username}</div>
          <div className="u-role">{user.role}</div>
        </div>
        <div className="logout-btn" onClick={onLogout}>Çıkış</div>
      </div>
    </aside>
  );
}