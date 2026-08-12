import { Doughnut } from 'react-chartjs-2';
import { getColors } from '../../chartColors';

export default function StatusDonutChart({ data, theme }) {
  const colors = getColors(theme);
  const counts = { Açık: 0, 'Onay Bekleniyor': 0, Kapalı: 0, Reddedildi: 0 };
  data.forEach((r) => { if (counts[r.durum] !== undefined) counts[r.durum]++; });

  const chartData = {
    labels: Object.keys(counts),
    datasets: [{
      data: Object.values(counts),
      backgroundColor: [colors.coral, colors.amber, colors.primary, colors.secondary],
      borderColor: 'transparent',
      hoverOffset: 6
    }]
  };

  const options = {
    plugins: {
      legend: { position: 'bottom', labels: { boxWidth: 10, boxHeight: 10, padding: 14 } }
    },
    cutout: '68%'
  };

  return (
    <div className="panel">
      <div className="panel-head"><h3>Durum Dağılımı</h3><span className="tag">Tüm talepler</span></div>
      <div className="chart-wrap"><Doughnut data={chartData} options={options} /></div>
    </div>
  );
}