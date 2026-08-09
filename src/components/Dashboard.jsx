import ApprovalQueue from './ApprovalQueue';
import PersonLaunchChart from './charts/PersonLaunchChart';
import OpenedTrendChart from './charts/OpenedTrendChart';
import RatioTrendChart from './charts/RatioTrendChart';
import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import KpiCard from './KpiCard';
import { DATA } from '../data/dummyData';
import LansmanTrendChart from './charts/LansmanTrendChart';
import PeoplePage from './PeoplePage';

export default function Dashboard({ user, onLogout }) {
  const [activeView, setActiveView] = useState('overview');

  // ---- KPI hesaplamaları ----
  const launches = DATA.filter((r) => r.lansman);
  const pending = DATA.filter((r) => r.durum === 'Açık' || r.durum === 'Onay Bekleniyor');
  const closed = DATA.filter((r) => r.durum === 'Kapalı');
  const ratio = DATA.length ? Math.round((closed.length / DATA.length) * 100) : 0;

  return (
  <div id="app" className="show">
    <Sidebar activeView={activeView} onChangeView={setActiveView} user={user} onLogout={onLogout} />
    <main className="main">
      <Topbar activeView={activeView} />

      {activeView === 'overview' && (
        <div className="kpi-grid">
          <KpiCard icon="🚀" iconBg="var(--teal-dim)" iconColor="var(--teal)"
            label="Toplam Lansman" value={launches.length}
            delta={`▲ ${launches.length} lansman tamamlandı`} />
          <KpiCard icon="⏳" iconBg="var(--amber-dim)" iconColor="var(--amber)"
            label="Bekleyen Talep" value={pending.length}
            delta={`● ${DATA.filter((r) => r.durum === 'Onay Bekleniyor').length} onay bekliyor`} />
          <KpiCard icon="📥" iconBg="var(--violet-dim)" iconColor="var(--violet)"
            label="Açılan Talep" value={DATA.length} delta="▲ tüm dönem" />
          <KpiCard icon="📊" iconBg="var(--coral-dim)" iconColor="var(--coral)"
            label="Açık / Kapalı Oranı" value={`${ratio}%`}
            delta={`${closed.length} kapalı / ${DATA.length} toplam`} />
        </div>
      )}

      {activeView === 'overview' && (
  <>
    <div className="grid-2">
      <LansmanTrendChart />
      <PersonLaunchChart />
    </div>
    <div className="grid-2">
      <OpenedTrendChart />
      <RatioTrendChart />
    </div>
  </>
)}

      {activeView === 'pending' && <ApprovalQueue />}
      {activeView === 'people' && <PeoplePage />}

{activeView !== 'overview' && activeView !== 'pending' && (
  <div className="panel">
    <div className="panel-head"><h3>{activeView} sayfası</h3></div>
    <p style={{ color: '#8A93A8' }}>Bu sayfayı sıradaki adımlarda dolduracağız.</p>
  </div>
)}
    </main>
  </div>
);
}