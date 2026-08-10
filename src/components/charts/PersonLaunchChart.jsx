import { Bar } from 'react-chartjs-2';
import { PEOPLE } from '../../data/dummyData';

export default function PersonLaunchChart({ data }) {
  const launches = data.filter((r) => r.lansman);
  const counts = {};
  PEOPLE.forEach((p) => (counts[p] = 0));
  launches.forEach((r) => counts[r.acanKisi]++);
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const chartData = {
    labels: sorted.map((p) => p[0]),
    datasets: [{ label: 'Lansman', data: sorted.map((p) => p[1]), backgroundColor: '#5AC8FA', borderRadius: 6 }]
  };

  const options = {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, ticks: { precision: 0 } },
      y: { grid: { display: false } }
    }
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Kişi Bazlı Lansman Adedi</h3><span className="tag">Top 8</span></div>
      <div className="chart-wrap tall"><Bar data={chartData} options={options} /></div>
    </div>
  );
}