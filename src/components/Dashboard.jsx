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
import StatusDonutChart from './charts/StatusDonutChart';
import TypeDonutChart from './charts/TypeDonutChart';
import { DATA, RANGE_END } from '../data/dummyData';
import ChatBot from './ChatBot';

const QUICK_RANGES = [
  { key: 90, label: 'Son 90 gün' },
  { key: 365, label: 'Son 12 ay' },
  { key: 'all', label: 'Tüm zamanlar' }
];


export default function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [activeView, setActiveView] = useState('overview');
  const [rangeKey, setRangeKey] = useState(365);
  const [search, setSearch] = useState('');
  const [dataVersion, setDataVersion] = useState(0); // ← YENİ: veri değişince artan sayaç

  const [navCollapsed, setNavCollapsed] = useState(false);

  const filteredData =
    rangeKey === 'all'
      ? DATA
      : DATA.filter((r) => (RANGE_END - r.acilis) / 86400000 <= rangeKey);

  const launches = filteredData.filter((r) => r.lansman);
  const pending = filteredData.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor');
  const closed = filteredData.filter((r) => r.durum === 'Kapalı');
  const ratio = filteredData.length ? Math.round((closed.length / filteredData.length) * 100) : 0;

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
    <div id="app" className={`show ${navCollapsed ? 'nav-collapsed' : ''}`}>
      <Sidebar
        activeView={activeView}
        onChangeView={setActiveView}
        user={user}
        onLogout={onLogout}
        collapsed={navCollapsed}
        onToggleCollapse={() => setNavCollapsed((v) => !v)}
      />

      <main className="main">
        <Topbar
          activeView={activeView}
          search={search}
          onSearchChange={setSearch}
          notifications={notifications}
          theme={theme}
          onToggleTheme={onToggleTheme}
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
            <KpiCard 
              label="Toplam Lansman" value={launches.length}
              delta={`▲ ${launches.length} lansman tamamlandı`} />
            <KpiCard 
              label="Bekleyen Talep" value={pending.length}
              delta={`● ${filteredData.filter((r) => r.durum === 'Onay Bekleniyor').length} onay bekliyor`} />
            <KpiCard 
              label="Açılan Talep" value={filteredData.length} delta="▲ seçili dönemde" />
            <KpiCard 
              label="Açık / Kapalı Oranı" value={`${ratio}%`}
              delta={`${closed.length} kapalı / ${filteredData.length} toplam`} />
          </div>
        )}

        {activeView === 'overview' && (
          <>
            <div className="grid-2">
              <LansmanTrendChart data={filteredData} theme={theme} />
              <PersonLaunchChart data={filteredData} theme={theme} />
            </div>
            <div className="grid-2">
              <OpenedTrendChart data={filteredData} theme={theme} />
              <RatioTrendChart data={filteredData} theme={theme} />
            </div>
            <div className="grid-2">
              <StatusDonutChart data={filteredData} theme={theme} />
              <TypeDonutChart data={filteredData} theme={theme} />
            </div>
          </>
        )}

        {activeView === 'pending' && (
          <ApprovalQueue search={search} onDataChange={() => setDataVersion((v) => v + 1)} />
        )}
        {activeView === 'people' && <PeoplePage theme={theme} search={search} />}
        {activeView === 'launches' && <LaunchesPage search={search} />}
        {activeView === 'teams' && <TeamsPage theme={theme} />}
        {activeView === 'reports' && <ReportsPage theme={theme} />}
      </main>
      <ChatBot data={filteredData} periodLabel={QUICK_RANGES.find(r => r.key === rangeKey)?.label} />
    </div>
  );
}