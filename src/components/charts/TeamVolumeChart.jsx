import { Bar } from 'react-chartjs-2';
import { DATA, TEAMS } from '../../data/dummyData';

export default function TeamVolumeChart() {
  const volume = TEAMS.map((t) => DATA.filter((r) => r.ekip === t).length);

  const data = {
    labels: TEAMS.map((t) => t.replace('TEAM-K-BO-', '')),
    datasets: [{ label: 'Talep', data: volume, backgroundColor: '#5AC8FA', borderRadius: 6 }]
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Takım Bazlı Toplam Talep</h3><span className="tag">Hacim</span></div>
      <div className="chart-wrap tall"><Bar data={data} options={options} /></div>
    </div>
  );
}