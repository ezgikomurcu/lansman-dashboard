import { Bar } from 'react-chartjs-2';
import { DATA, RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';

export default function CompareChart() {
  const months = lastNMonths(6, RANGE_END);
  const counts = months.map(
    (mk) => DATA.filter((r) => r.lansman && monthKey(r.lansman) === mk).length
  );

  const data = {
    labels: months.map(monthLabel),
    datasets: [{ label: 'Lansman', data: counts, backgroundColor: '#FFD200', borderRadius: 6, maxBarThickness: 30 }]
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
      <div className="panel-head"><h3>Bu Ay vs Geçen Ay — Lansman Trendi</h3><span className="tag">Karşılaştırma</span></div>
      <div className="chart-wrap tall"><Bar data={data} options={options} /></div>
    </div>
  );
}