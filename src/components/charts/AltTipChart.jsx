import { Bar } from 'react-chartjs-2';
import { getColors } from '../../chartColors';
import { cartesianOptions } from '../../chartOptions';

export default function AltTipChart({ data, theme, periodLabel }) {
  const colors = getColors(theme);
  const counts = {};
  data.forEach((r) => {
    const key = r.altTip || 'Diğer';
    counts[key] = (counts[key] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const chartData = {
    labels: sorted.map((p) => p[0]),
    datasets: [{ label: 'Talep', data: sorted.map((p) => p[1]), backgroundColor: colors.secondary, borderRadius: 6 }]
  };

  const options = cartesianOptions({ colors, horizontal: true });
  const summary = `Alt tip dağılımı: ${sorted.map(([k, v]) => `${k} ${v}`).join(', ')}`;

  return (
    <div className="panel" style={{ gridColumn: '1' }}>
      <div className="panel-head"><h3>Alt Tip Dağılımı</h3><span className="tag">{periodLabel || 'Tüm talepler'}</span></div>
      <div className="chart-wrap tall" role="img" aria-label={summary}><Bar data={chartData} options={options} /></div>
    </div>
  );
}