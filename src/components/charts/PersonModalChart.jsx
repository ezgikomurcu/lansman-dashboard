import { Bar } from 'react-chartjs-2';
import { DATA, RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';

export default function PersonModalChart({ personName }) {
  const launches = DATA.filter((r) => r.acanKisi === personName && r.lansman);
  const months = lastNMonths(12, RANGE_END);
  const counts = months.map((mk) => launches.filter((r) => monthKey(r.lansman) === mk).length);

  const data = {
    labels: months.map(monthLabel),
    datasets: [{ label: 'Lansman', data: counts, backgroundColor: '#FFD200', borderRadius: 6 }]
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  return (
    <div className="chart-wrap">
      <Bar data={data} options={options} />
    </div>
  );
}