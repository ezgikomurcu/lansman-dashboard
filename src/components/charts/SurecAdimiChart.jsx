import { Bar } from 'react-chartjs-2';
import { getColors } from '../../chartColors';

export default function SurecAdimiChart({ data, theme }) {
  const colors = getColors(theme);
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

  const options = {
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, ticks: { precision: 0 } },
      y: { grid: { display: false } }
    }
  };

  return (
    <div className="panel narrow">
      <div className="panel-head"><h3>Süreç Adımı Dağılımı</h3><span className="tag">Aktif talepler (Bitti hariç)</span></div>
      <div className="chart-wrap"><Bar data={chartData} options={options} /></div>
    </div>
  );
}