import { Bar } from 'react-chartjs-2';
import { DATA, RANGE_END, lastNMonths, monthKey, monthLabel } from '../../data/dummyData';
import { getColors } from '../../chartColors';
import { cartesianOptions } from '../../chartOptions';

export default function CompareChart({ endDate }) {
  const colors = getColors();
  const end = endDate || RANGE_END;
  const months = lastNMonths(6, end);
  const counts = months.map((mk) => DATA.filter((r) => r.lansman && monthKey(r.lansman) === mk).length);

  const data = {
    labels: months.map(monthLabel),
    datasets: [{ label: 'Lansman', data: counts, backgroundColor: colors.coral, borderRadius: 6, maxBarThickness: 30 }]
  };

  const options = cartesianOptions({ colors });
  const summary = `Seçili ay öncesi 6 aylık lansman trendi: ${months.map((mk, i) => `${monthLabel(mk)} ${counts[i]}`).join(', ')}`;

  return (
    <div className="panel">
      <div className="panel-head"><h3>Seçili Ay Öncesi 6 Aylık Lansman Trendi</h3><span className="tag">Karşılaştırma</span></div>
      <div className="chart-wrap" role="img" aria-label={summary}><Bar data={data} options={options} /></div>
    </div>
  );
}