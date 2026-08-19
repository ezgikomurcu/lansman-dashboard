import { Bar } from 'react-chartjs-2';
import { getColors } from '../../chartColors';
import { cartesianOptions } from '../../chartOptions';

export default function SurecAdimiChart({ data }) {
  const colors = getColors();
  const counts = {};
  data.forEach((r) => {
    const key = r.surecAdimi || 'Belirsiz';
    counts[key] = (counts[key] || 0) + 1;
  });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  const chartData = {
    labels: sorted.map((p) => p[0]),
    datasets: [{ label: 'Talep', data: sorted.map((p) => p[1]), backgroundColor: colors.amber, borderRadius: 6 }]
  };

  const options = cartesianOptions({ colors, horizontal: true });
  const summary = `Süreç adımı dağılımı: ${sorted.map(([k, v]) => `${k} ${v}`).join(', ')}`;

  return (
    <div className="panel narrow">
      <div className="panel-head"><h3>Süreç Adımı Dağılımı</h3><span className="tag">Aktif talepler (Bitti hariç)</span></div>
      <div className="chart-wrap" role="img" aria-label={summary}><Bar data={chartData} options={options} /></div>
    </div>
  );
}