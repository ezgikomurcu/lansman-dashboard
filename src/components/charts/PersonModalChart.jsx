import { Bar } from 'react-chartjs-2';
import { RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';
import { getColors } from '../../chartColors';

export default function PersonModalChart({ personName, theme, data, months = 12, endDate }) {
  const colors = getColors(theme);
  const end = endDate || RANGE_END;
  const source = data || [];
  const launches = source.filter((r) => r.acanKisi === personName && r.lansman);
  const monthList = lastNMonths(months, end);
  const counts = monthList.map((mk) => launches.filter((r) => monthKey(r.lansman) === mk).length);

  const chartData = {
    labels: monthList.map(monthLabel),
    datasets: [{ label: 'Lansman', data: counts, backgroundColor: colors.primary, borderRadius: 6 }]
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
      <Bar data={chartData} options={options} />
    </div>
  );
}