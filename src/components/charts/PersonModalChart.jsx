import { Bar } from 'react-chartjs-2';
import { RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';
import { getColors } from '../../chartColors';
import { cartesianOptions } from '../../chartOptions';

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

  const options = cartesianOptions({ colors });
  const summary = `${personName} aylık lansman sayısı: ${monthList.map((mk, i) => `${monthLabel(mk)} ${counts[i]}`).join(', ')}`;

  return (
    <div className="chart-wrap" role="img" aria-label={summary}>
      <Bar data={chartData} options={options} />
    </div>
  );
}