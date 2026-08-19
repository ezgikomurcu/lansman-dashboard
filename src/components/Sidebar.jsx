import { GridIcon, RocketIcon, ClockIcon, UserIcon, UsersIcon, ReportIcon, ChevronLeftIcon, ChevronRightIcon, LogoutIcon } from './Icons';

const NAV_ITEMS = [
  { key: 'overview', label: 'Genel Bakış', Icon: GridIcon },
  { key: 'launches', label: 'Lansmanlar', Icon: RocketIcon },
  { key: 'pending', label: 'Bekleyen Talepler', Icon: ClockIcon },
  { key: 'people', label: 'Kişi Performansı', Icon: UserIcon },
  { key: 'teams', label: 'Takım Dağılımı', Icon: UsersIcon },
  { key: 'reports', label: 'Raporlar', Icon: ReportIcon }
];

export default function Sidebar({ activeView, onChangeView, user, onLogout, collapsed, onToggleCollapse }) {
  const displayName = user.fullName || user.username;
  const initials = displayName
    .split(/[.\s]/)
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <aside className="sidebar">
      <div className="brand">
        <button type="button" className="brand-link" onClick={() => onChangeView('overview')} aria-label="Ana sayfaya dön">
          <div className="mark">
            <img src="/logo.png" className="mark-img" alt="logo" />
          </div>
          <div>
            <b>Launchly</b>
            <small>Lansman Kontrol Merkezi</small>
          </div>
        </button>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={(e) => { onToggleCollapse(); e.currentTarget.blur(); }}
          aria-label={collapsed ? 'Menüyü genişlet' : 'Menüyü daralt'}
        >
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      <nav aria-label="Ana gezinme">
        {NAV_ITEMS.map((item) => {
          const Icon = item.Icon;
          return (
            <button
              type="button"
              key={item.key}
              className={`nav-item ${activeView === item.key ? 'active' : ''}`}
              onClick={() => onChangeView(item.key)}
              aria-current={activeView === item.key ? 'page' : undefined}
            >
              <Icon className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div>
          <div className="u-name">{displayName}</div>
        </div>
        <button type="button" className="logout-btn" onClick={onLogout} aria-label="Çıkış yap" title="Çıkış yap">
          <LogoutIcon />
        </button>
      </div>
    </aside>
  );
}