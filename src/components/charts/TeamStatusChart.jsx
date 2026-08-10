import { Bar } from 'react-chartjs-2';
import { DATA, TEAMS } from '../../data/dummyData';

export default function TeamStatusChart() {
  const teamStatus = {};
  TEAMS.forEach((t) => (teamStatus[t] = { Açık: 0, 'Onay Bekleniyor': 0, Kapalı: 0 }));
  DATA.forEach((r) => {
    if (teamStatus[r.ekip][r.durum] !== undefined) teamStatus[r.ekip][r.durum]++;
  });

  const data = {
    labels: TEAMS.map((t) => t.replace('TEAM-K-BO-', '')),
    datasets: [
      { label: 'Açık', data: TEAMS.map((t) => teamStatus[t]['Açık']), backgroundColor: '#FF5C72', borderRadius: 5 },
      { label: 'Onay Bekleniyor', data: TEAMS.map((t) => teamStatus[t]['Onay Bekleniyor']), backgroundColor: '#FFB020', borderRadius: 5 },
      { label: 'Kapalı', data: TEAMS.map((t) => teamStatus[t]['Kapalı']), backgroundColor: '#FFD200', borderRadius: 5 }
    ]
  };

  const options = {
    plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 14 } } },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { precision: 0 } }
    }
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Takıma Göre Durum Dağılımı</h3><span className="tag">Açık · Onay · Kapalı</span></div>
      <div className="chart-wrap tall"><Bar data={data} options={options} /></div>
    </div>
  );
}