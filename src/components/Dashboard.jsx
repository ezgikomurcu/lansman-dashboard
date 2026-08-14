import { useState } from 'react';
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
import ChatBot from './ChatBot';
import Toast from './Toast';
import { DATA, RANGE_END } from '../data/dummyData';
import AltTipChart from './charts/AltTipChart';
import { CalendarIcon } from './Icons';

const QUICK_RANGES = [
  { key: 90, label: 'Son 90 gün' },
  { key: 365, label: 'Son 12 ay' },
  { key: 'all', label: 'Tüm zamanlar' }
];

export default function Dashboard({ user, onLogout, theme, onToggleTheme }) {
  const [activeView, setActiveView] = useState('overview');
  const [rangeKey, setRangeKey] = useState(365);
  const [search, setSearch] = useState('');
  const [dataVersion, setDataVersion] = useState(0);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ---- Seçili döneme göre veriyi filtrele ----
  let filteredData = DATA;
  if (rangeKey === 'custom' && customStart && customEnd) {
    const start = new Date(customStart);
    const end = new Date(customEnd);
    end.setHours(23, 59, 59, 999);
    filteredData = DATA.filter((r) => r.acilis >= start && r.acilis <= end);
  } else if (typeof rangeKey === 'number') {
    filteredData = DATA.filter((r) => (RANGE_END - r.acilis) / 86400000 <= rangeKey);
  }

  // ---- Grafiklerin ay ekseni, seçili döneme göre dinamik ----
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

  const applyCustomRange = () => {
    if (customStart && customEnd) {
      setRangeKey('custom');
      setShowCustomPicker(false);
    }
  };

  const customLabel =
    rangeKey === 'custom' && customStart && customEnd ? `${customStart} → ${customEnd}` : 'Özel Aralık';

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
                  <label>Başlangıç</label>
                  <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label>Bitiş</label>
                  <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} />
                </div>
                <button className="btn primary small" onClick={applyCustomRange}>Uygula</button>
              </div>
            )}
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
              <LansmanTrendChart data={filteredData} theme={theme} months={monthsToShow} endDate={chartEndDate} />
              <PersonLaunchChart data={filteredData} theme={theme} />
            </div>
            <div className="grid-2">
              <OpenedTrendChart data={filteredData} theme={theme} months={monthsToShow} endDate={chartEndDate} />
              <RatioTrendChart data={filteredData} theme={theme} months={monthsToShow} endDate={chartEndDate} />
            </div>
            <div className="grid-2">
              <StatusDonutChart data={filteredData} theme={theme} />
              <TypeDonutChart data={filteredData} theme={theme} />
            </div>
            <AltTipChart data={filteredData} theme={theme} />
          </>
        )}

        {activeView === 'pending' && (
          <ApprovalQueue
            search={search}
            onDataChange={() => setDataVersion((v) => v + 1)}
            onNotify={notify}
            theme={theme}
          />
        )}
        {activeView === 'people' && <PeoplePage theme={theme} search={search} />}
        {activeView === 'launches' && <LaunchesPage search={search} />}
        {activeView === 'teams' && <TeamsPage theme={theme} />}
        {activeView === 'reports' && <ReportsPage theme={theme} />}
      </main>
      <ChatBot data={filteredData} periodLabel={rangeKey === 'custom' ? customLabel : QUICK_RANGES.find((r) => r.key === rangeKey)?.label} />
      <Toast toast={toast} />
    </div>
  );
}