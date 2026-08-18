import { GridIcon, RocketIcon, ClockIcon, UserIcon, UsersIcon, ReportIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

const NAV_ITEMS = [
  { key: 'overview', label: 'Genel Bakış', Icon: GridIcon },
  { key: 'launches', label: 'Lansmanlar', Icon: RocketIcon },
  { key: 'pending', label: 'Bekleyen Talepler', Icon: ClockIcon },
  { key: 'people', label: 'Kişi Performansı', Icon: UserIcon },
  { key: 'teams', label: 'Takım Dağılımı', Icon: UsersIcon },
  { key: 'reports', label: 'Raporlar', Icon: ReportIcon }
];

export default function Sidebar({ activeView, onChangeView, user, onLogout, collapsed, onToggleCollapse }) {
  const initials = user.username
    .split(/[.\s]/)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join('');

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">
          <img src="/logo.png" className="mark-img" alt="logo" />
        </div>
        <div>
          <b>Launchly</b>
          <small>Lansman Kontrol Merkezi</small>
        </div>
      </div>

      <div className="sidebar-toggle-row">
        <div className="sidebar-toggle" onClick={onToggleCollapse}>
          {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </div>
      </div>

      {NAV_ITEMS.map((item) => {
        const Icon = item.Icon;
        return (
          <div
            key={item.key}
            className={`nav-item ${activeView === item.key ? 'active' : ''}`}
            onClick={() => onChangeView(item.key)}
          >
            <Icon className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </div>
        );
      })}

      <div className="sidebar-user">
        <div className="avatar">{initials}</div>
        <div>
          <div className="u-name">{user.username}</div>
        </div>
        <div className="logout-btn" onClick={onLogout}>Çıkış</div>
      </div>
    </aside>
  );
}