import { Bar } from 'react-chartjs-2';
import { RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';
import { getColors } from '../../chartColors';

export default function LansmanTrendChart({ data, theme }) {
  const colors = getColors(theme);
  const launches = data.filter((r) => r.lansman);
  const months = lastNMonths(12, RANGE_END);
  const counts = months.map((mk) => launches.filter((r) => monthKey(r.lansman) === mk).length);

  const chartData = {
    labels: months.map(monthLabel),
    datasets: [{ label: 'Lansman', data: counts, backgroundColor: colors.primary, borderRadius: 6, maxBarThickness: 26 }]
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
      <div className="panel-head"><h3>Yıllık Ay Bazlı Lansman Sayısı</h3><span className="tag">Aylık trend</span></div>
      <div className="chart-wrap tall"><Bar data={chartData} options={options} /></div>
    </div>
  );
}