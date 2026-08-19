import { Bar } from 'react-chartjs-2';
import { RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';
import { getColors } from '../../chartColors';
import { cartesianOptions } from '../../chartOptions';

export default function LansmanTrendChart({ data, theme, months = 12, endDate }) {
  const colors = getColors(theme);
  const end = endDate || RANGE_END;
  const launches = data.filter((r) => r.lansman);
  const monthList = lastNMonths(months, end);
  const counts = monthList.map((mk) => launches.filter((r) => monthKey(r.lansman) === mk).length);

  const chartData = {
    labels: monthList.map(monthLabel),
    datasets: [{ label: 'Lansman', data: counts, backgroundColor: colors.primary, borderRadius: 6, maxBarThickness: 26 }]
  };

  const options = cartesianOptions({ colors });
  const summary = `Yıllık ay bazlı lansman sayısı: ${monthList.map((mk, i) => `${monthLabel(mk)} ${counts[i]}`).join(', ')}`;

  return (
    <div className="panel">
      <div className="panel-head"><h3>Yıllık Ay Bazlı Lansman Sayısı</h3><span className="tag">Aylık trend</span></div>
      <div className="chart-wrap tall" role="img" aria-label={summary}><Bar data={chartData} options={options} /></div>
    </div>
  );
}