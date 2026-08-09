const PAGE_TITLES = {
  overview: 'Genel Bakış',
  launches: 'Lansmanlar',
  pending: 'Bekleyen Talepler',
  people: 'Kişi Performansı',
  teams: 'Takım Dağılımı',
  reports: 'Raporlar'
};

export default function Topbar({ activeView }) {
  return (
    <div className="topbar">
      <div>
        <h2>{PAGE_TITLES[activeView]}</h2>
        <div className="subtitle">Tüm ekip · seçili dönem</div>
      </div>
      <div className="topbar-actions">
        <div className="search-box">
          <span>🔎</span>
          <input type="text" placeholder="Talep ID veya kişi ara..." />
        </div>
        <div className="icon-btn">🔔</div>
        <div className="icon-btn">🌙</div>
      </div>
    </div>
  );
}