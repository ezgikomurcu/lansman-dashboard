import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import KpiCard from './KpiCard';
import ApprovalQueue from './ApprovalQueue';
import PeoplePage from './PeoplePage';
import LaunchesPage from './LaunchesPage';
import TeamsPage from './TeamsPage';
import ReportsPage from './ReportsPage';
import LansmanTrendChart from './charts/LansmanTrendChart';
import PersonLaunchChart from './charts/PersonLaunchChart';
import OpenedTrendChart from './charts/OpenedTrendChart';
import RatioTrendChart from './charts/RatioTrendChart';
import { DATA, RANGE_END } from '../data/dummyData';

const QUICK_RANGES = [
  { key: 90, label: 'Son 90 gün' },
  { key: 365, label: 'Son 12 ay' },
  { key: 'all', label: 'Tüm zamanlar' }
];

export default function Dashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('overview');
  const [rangeKey, setRangeKey] = useState(365);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('dark');

  // Tema her değiştiğinde <body>'ye 'light' class'ını ekle/çıkar.
  // useEffect = "bir state değiştiğinde bunu otomatik çalıştır" demek.
  useEffect(() => {
    document.body.classList.toggle('light', theme === 'light');
  }, [theme]);

  const filteredData =
    rangeKey === 'all'
      ? DATA
      : DATA.filter((r) => (RANGE_END - r.acilis) / 86400000 <= rangeKey);

  const launches = filteredData.filter((r) => r.lansman);
  const pending = filteredData.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor');
  const closed = filteredData.filter((r) => r.durum === 'Kapalı');
  const ratio = filteredData.length ? Math.round((closed.length / filteredData.length) * 100) : 0;

  // ---- Bildirimler (tüm DATA üzerinden, dönem filtresinden bağımsız) ----
  const slaBreach = DATA.filter(
    (r) => (r.durum === 'Açık' || r.durum === 'Onay Bekleniyor') && (RANGE_END - r.acilis) / 86400000 > 10
  ).length;
  const pendingApproval = DATA.filter((r) => r.durum === 'Onay Bekleniyor').length;
  const newThisWeek = DATA.filter((r) => (RANGE_END - r.acilis) / 86400000 < 7).length;

  const notifications = [];
  if (slaBreach > 0) notifications.push({ cls: 'danger', title: `${slaBreach} talep SLA süresini aştı`, desc: '10 günden uzun süredir bekliyor' });
  if (pendingApproval > 0) notifications.push({ cls: 'warn', title: `${pendingApproval} talep onay bekliyor`, desc: 'Yönetici onayı gerekiyor' });
  if (newThisWeek > 0) notifications.push({ cls: 'warn', title: `${newThisWeek} yeni talep açıldı`, desc: 'Son 7 gün içinde' });

  return (
    <div id="app" className="show">
      <Sidebar activeView={activeView} onChangeView={setActiveView} user={user} onLogout={onLogout} />
      <main className="main">
        <Topbar
          activeView={activeView}
          search={search}
          onSearchChange={setSearch}
          notifications={notifications}
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        />

        {activeView === 'overview' && (
          <div className="filters">
            <div className="quick-range">
              {QUICK_RANGES.map((r) => (
                <button
                  key={r.key}
                  className={`qr-btn ${rangeKey === r.key ? 'active' : ''}`}
                  onClick={() => setRangeKey(r.key)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeView === 'overview' && (
          <div className="kpi-grid">
            <KpiCard icon="🚀" iconBg="var(--teal-dim)" iconColor="var(--teal)"
              label="Toplam Lansman" value={launches.length}
              delta={`▲ ${launches.length} lansman tamamlandı`} />
            <KpiCard icon="⏳" iconBg="var(--amber-dim)" iconColor="var(--amber)"
              label="Bekleyen Talep" value={pending.length}
              delta={`● ${filteredData.filter((r) => r.durum === 'Onay Bekleniyor').length} onay bekliyor`} />
            <KpiCard icon="📥" iconBg="var(--violet-dim)" iconColor="var(--violet)"
              label="Açılan Talep" value={filteredData.length} delta="▲ seçili dönemde" />
            <KpiCard icon="📊" iconBg="var(--coral-dim)" iconColor="var(--coral)"
              label="Açık / Kapalı Oranı" value={`${ratio}%`}
              delta={`${closed.length} kapalı / ${filteredData.length} toplam`} />
          </div>
        )}

        {activeView === 'overview' && (
          <>
            <div className="grid-2">
              <LansmanTrendChart data={filteredData} />
              <PersonLaunchChart data={filteredData} />
            </div>
            <div className="grid-2">
              <OpenedTrendChart data={filteredData} />
              <RatioTrendChart data={filteredData} />
            </div>
          </>
        )}

        {activeView === 'pending' && <ApprovalQueue search={search} />}
        {activeView === 'people' && <PeoplePage />}
        {activeView === 'launches' && <LaunchesPage search={search} />}
        {activeView === 'teams' && <TeamsPage />}
        {activeView === 'reports' && <ReportsPage />}
      </main>
    </div>
  );
}